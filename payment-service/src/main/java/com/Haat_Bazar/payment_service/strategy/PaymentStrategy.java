package com.Haat_Bazar.payment_service.strategy;

public interface PaymentStrategy {
    boolean pay(Double amount, Long orderId);
}
