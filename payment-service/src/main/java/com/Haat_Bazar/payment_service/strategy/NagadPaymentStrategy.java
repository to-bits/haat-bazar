package com.Haat_Bazar.payment_service.strategy;

import org.springframework.stereotype.Component;

@Component
public class NagadPaymentStrategy implements PaymentStrategy {
    @Override
    public boolean pay(Double amount, Long orderId) {
        System.out.println("Processing Nagad payment of " + amount + " for order " + orderId);
        return true;
    }
}
