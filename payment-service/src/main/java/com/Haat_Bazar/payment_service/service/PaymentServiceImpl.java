package com.Haat_Bazar.payment_service.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.Haat_Bazar.payment_service.client.OrderServiceClient;
import com.Haat_Bazar.payment_service.dto.PaymentRequest;
import com.Haat_Bazar.payment_service.dto.PaymentResponse;
import com.Haat_Bazar.payment_service.entity.Payment;
import com.Haat_Bazar.payment_service.entity.PaymentStatus;
import com.Haat_Bazar.payment_service.repository.PaymentRepository;
import com.Haat_Bazar.payment_service.strategy.BkashPaymentStrategy;
import com.Haat_Bazar.payment_service.strategy.CardPaymentStrategy;
import com.Haat_Bazar.payment_service.strategy.NagadPaymentStrategy;
import com.Haat_Bazar.payment_service.strategy.PaymentStrategy;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService{
    private final PaymentRepository paymentRepository;
    private final OrderServiceClient orderServiceClient;
    private final CardPaymentStrategy cardPaymentStrategy;
    private final BkashPaymentStrategy bkashPaymentStrategy;
    private final NagadPaymentStrategy nagadPaymentStrategy;

    private PaymentStrategy selectStrategy(com.Haat_Bazar.payment_service.entity.PaymentMethod method)
    {
        return switch (method)
        {
            case CARD -> cardPaymentStrategy;
            case BKASH -> bkashPaymentStrategy;
            case NAGAD -> nagadPaymentStrategy;
        };
    }

    @Override
    public PaymentResponse processPayment(PaymentRequest request)
    {
        PaymentStrategy strategy = selectStrategy(request.getMethod());
        boolean success = strategy.pay(request.getAmount(), request.getOrderId());

        PaymentStatus status = success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;

        Payment payment = Payment.builder()
                .orderId(request.getOrderId())
                .userId(request.getUserId())
                .amount(request.getAmount())
                .method(request.getMethod())
                .status(status)
                .createdAt(LocalDateTime.now())
                .build();

        paymentRepository.save(payment);

        if (success)
        {
            orderServiceClient.markOrderAsPaid(request.getOrderId());
        }
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .userId(payment.getUserId())
                .amount(payment.getAmount())
                .method(payment.getMethod())
                .status(payment.getStatus())
                .createdAt(payment.getCreatedAt())
                .message(success ? "Payment successful" : "Payment failed")
                .build();
    }

    @Override
    public PaymentResponse getPaymentByOrderId(Long orderId)
    {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for order" + orderId));

        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .userId(payment.getUserId())
                .amount(payment.getAmount())
                .method(payment.getMethod())
                .status(payment.getStatus())
                .createdAt(payment.getCreatedAt())
                .message("Payment retrieved successfully")
                .build();
    }
}
