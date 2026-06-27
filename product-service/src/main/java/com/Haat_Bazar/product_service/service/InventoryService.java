package com.Haat_Bazar.product_service.service;

import com.Haat_Bazar.product_service.dto.InventoryRequest;
import com.Haat_Bazar.product_service.dto.InventoryResponse;

public interface InventoryService {

    InventoryResponse updateStock(Long productId, InventoryRequest request);

    InventoryResponse checkAvailability(Long productId);

    void reduceStock(Long productId, Integer quantity);
}
