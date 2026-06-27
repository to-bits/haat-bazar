package com.Haat_Bazar.payment_service.strategy;


public class CardPaymentStrategy implements PaymentStrategy{
    @Override
    public boolean pay(Double amount, Long orderId)
    {
        System.out.println("Processing CARD payment of " + amount + " for order " + orderId);
        return true;
    }
}
