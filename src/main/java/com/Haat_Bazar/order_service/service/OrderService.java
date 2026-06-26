package com.Haat_Bazar.order_service.service;

import com.Haat_Bazar.order_service.dto.CheckoutRequest;
import com.Haat_Bazar.order_service.dto.OrderItemResponse;
import com.Haat_Bazar.order_service.dto.OrderResponse;
import com.Haat_Bazar.order_service.exception.InsufficientStockException;
import com.Haat_Bazar.order_service.exception.ResourceNotFoundException;
import com.Haat_Bazar.order_service.model.*;
import com.Haat_Bazar.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final RestTemplate restTemplate;

    // Sajib's inventory-service at port 8082
    // GET  /api/inventory/{productId}                   → check stock
    // PUT  /api/inventory/{productId}/reduce?quantity=N → deduct stock
    @Value("${inventory.service.url:http://localhost:8082}")
    private String inventoryServiceUrl;

    @Transactional
    public OrderResponse checkout(Long userId, CheckoutRequest checkoutRequest) {
        log.info("Starting checkout process for user: {}", userId);

        // 1. Get Cart
        Cart cart = cartService.getCart(userId);

        // 2. Validate Cart
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new InsufficientStockException("Cannot checkout: Cart is empty");
        }

        // 3. Check stock via Sajib's inventory-service
        checkInventoryStock(cart.getItems());

        // 4. Calculate Total
        Double total = cart.getCartTotal();
        log.info("Calculated total for order: {}", total);

        // 5. Create Order (with status PENDING)
        Order order = Order.builder()
                .userId(userId)
                .totalAmount(total)
                .status(OrderStatus.PENDING)
                .items(new ArrayList<>())
                .build();

        // 6. Save Order Items
        List<OrderItem> orderItems = cart.getItems().stream()
                .map(cartItem -> OrderItem.builder()
                        .productId(cartItem.getProductId())
                        .quantity(cartItem.getQuantity())
                        .price(cartItem.getPrice())
                        .order(order)
                        .build())
                .collect(Collectors.toList());

        order.setItems(orderItems);
        Order savedOrder = orderRepository.save(order);
        log.info("Order created in PENDING status with ID: {}", savedOrder.getId());

        // 7. Deduct stock via Sajib's inventory-service
        deductInventoryStock(cart.getItems());

        // 8. Clear Cart
        cartService.clearCart(userId);
        log.info("Cleared shopping cart for user: {}", userId);

        // 8. Finalize Order (status CONFIRMED)
        savedOrder.setStatus(OrderStatus.CONFIRMED);
        Order finalizedOrder = orderRepository.save(savedOrder);
        log.info("Order status updated to CONFIRMED for ID: {}", finalizedOrder.getId());

        return mapToOrderResponse(finalizedOrder);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        return mapToOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUser(Long userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        order.setStatus(status);
        Order updated = orderRepository.save(order);
        log.info("Order status updated to {} for ID: {}", status, orderId);
        return mapToOrderResponse(updated);
    }

    /**
     * REQ-PAY-03: Called by the payment-service via Feign to finalize an order after payment.
     * Sets the order status to CONFIRMED.
     */
    @Transactional
    public void markPaid(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);
        log.info("Order {} marked as paid (status → CONFIRMED)", orderId);
    }

    /**
     * Check stock by calling GET /api/inventory/{productId} on Sajib's inventory-service.
     * Response is expected to contain a 'stock' (or 'availableQuantity') integer field.
     */
    private void checkInventoryStock(List<CartItem> cartItems) {
        for (CartItem item : cartItems) {
            String url = inventoryServiceUrl + "/api/inventory/" + item.getProductId();
            try {
                Map<?, ?> inventory = restTemplate.getForObject(url, Map.class);
                if (inventory == null) {
                    throw new InsufficientStockException("Inventory not found for product: " + item.getProductId());
                }
                // Sajib's response may use 'stock' or 'availableQuantity' — try both
                Integer stock = inventory.get("stock") != null
                        ? (Integer) inventory.get("stock")
                        : (Integer) inventory.get("availableQuantity");
                if (stock == null || stock < item.getQuantity()) {
                    throw new InsufficientStockException(
                            "Insufficient stock for product ID " + item.getProductId() +
                            ". Available: " + (stock == null ? 0 : stock) +
                            ", Requested: " + item.getQuantity());
                }
                log.info("Stock OK for product {}: available={}, requested={}",
                        item.getProductId(), stock, item.getQuantity());
            } catch (InsufficientStockException e) {
                throw e;
            } catch (Exception e) {
                log.error("Error calling inventory-service for product {}: {}", item.getProductId(), e.getMessage());
                throw new InsufficientStockException(
                        "Could not verify stock for product ID " + item.getProductId() + ". Inventory service unavailable.");
            }
        }
    }

    /**
     * Deduct stock by calling PUT /api/inventory/{productId}/reduce?quantity={amount}
     * on Sajib's inventory-service.
     */
    private void deductInventoryStock(List<CartItem> cartItems) {
        for (CartItem item : cartItems) {
            String url = inventoryServiceUrl + "/api/inventory/" + item.getProductId()
                    + "/reduce?quantity=" + item.getQuantity();
            try {
                restTemplate.put(url, null);
                log.info("Stock deducted for product {}: quantity={}", item.getProductId(), item.getQuantity());
            } catch (Exception e) {
                log.error("Failed to deduct stock for product {}: {}", item.getProductId(), e.getMessage());
                // Log but don't fail — order is already saved; a retry/saga can handle this
            }
        }
    }

    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .build();
    }
}
