package com.Haat_Bazar.payment_service.dto;

import java.time.LocalDateTime;

import com.Haat_Bazar.payment_service.entity.PaymentMethod;
import com.Haat_Bazar.payment_service.entity.PaymentStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder

public class PaymentResponse {
    private Long id;
    private Long orderId;
    private Long userId;
    private Double amount;
    private PaymentMethod method;
    private PaymentStatus status;
    private LocalDateTime createdAt;
    private String message;
}
