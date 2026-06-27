package com.Haat_Bazar.product_service.service;

import com.Haat_Bazar.product_service.dto.InventoryRequest;
import com.Haat_Bazar.product_service.dto.InventoryResponse;
import com.Haat_Bazar.product_service.entity.Inventory;
import com.Haat_Bazar.product_service.entity.Product;
import com.Haat_Bazar.product_service.exception.ResourceNotFoundException;
import com.Haat_Bazar.product_service.repository.InventoryRepository;
import com.Haat_Bazar.product_service.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public InventoryResponse updateStock(
            Long productId,
            InventoryRequest request
    ) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found with id: " + productId
                        ));

        Inventory inventory = inventoryRepository
                .findByProductId(productId)
                .orElse(Inventory.builder()
                        .product(product)
                        .quantity(0)
                        .build());

        inventory.setQuantity(request.getQuantity());
        inventoryRepository.save(inventory);

        // also sync stock in product table
        product.setStock(request.getQuantity());
        productRepository.save(product);

        return mapToResponse(inventory);
    }

    @Override
    public InventoryResponse checkAvailability(Long productId) {

        Inventory inventory = inventoryRepository
                .findByProductId(productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Inventory not found for product: " + productId
                        ));

        return mapToResponse(inventory);
    }

    @Override
    @Transactional
    public void reduceStock(Long productId, Integer quantity) {

        Inventory inventory = inventoryRepository
                .findByProductId(productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Inventory not found for product: " + productId
                        ));

        if (inventory.getQuantity() < quantity) {
            throw new RuntimeException(
                    "Insufficient stock for product: " + productId
            );
        }

        inventory.setQuantity(inventory.getQuantity() - quantity);
        inventoryRepository.save(inventory);

        // also sync stock in product table
        Product product = inventory.getProduct();
        product.setStock(inventory.getQuantity());
        productRepository.save(product);
    }

    private InventoryResponse mapToResponse(Inventory inventory) {

        return InventoryResponse.builder()
                .productId(inventory.getProduct().getId())
                .productName(inventory.getProduct().getName())
                .quantity(inventory.getQuantity())
                .available(inventory.getQuantity() > 0)
                .build();
    }
}
