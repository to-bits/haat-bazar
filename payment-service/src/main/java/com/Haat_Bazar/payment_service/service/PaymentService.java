package com.Haat_Bazar.payment_service.service;

import com.Haat_Bazar.payment_service.dto.PaymentRequest;
import com.Haat_Bazar.payment_service.dto.PaymentResponse;

public interface PaymentService {
    PaymentResponse processPayment(PaymentRequest request);
    PaymentResponse getPaymentByOrderId(Long orderId);
}
