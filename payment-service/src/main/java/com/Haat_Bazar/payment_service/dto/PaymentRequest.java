package com.Haat_Bazar.payment_service.dto;

import com.Haat_Bazar.payment_service.entity.PaymentMethod;

import lombok.Data;

@Data
public class PaymentRequest {
    private Long orderId;
    private Long userId;
    private Double amount;
    private PaymentMethod method;
}
