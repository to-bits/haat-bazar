package com.Haat_Bazar.payment_service.strategy;

public class BkashPaymentStrategy implements PaymentStrategy {
    @Override
    public boolean pay(Double amount, Long orderId)
    {
        System.out.println("Processing Bkash payment of " + amount + " for order " + orderId);
        return true;
    }
}
