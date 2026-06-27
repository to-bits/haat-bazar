package com.Haat_Bazar.payment_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

@FeignClient(name = "ORDER-SERVICE")
public interface OrderServiceClient {
    @PutMapping("/api/orders/{orderId}/mark-paid")
    void markOrderAsPaid(@PathVariable Long orderId);
}
    