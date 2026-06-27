package com.Haat_Bazar.product_service.controller;

import com.Haat_Bazar.product_service.dto.InventoryRequest;
import com.Haat_Bazar.product_service.dto.InventoryResponse;
import com.Haat_Bazar.product_service.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PutMapping("/{productId}")
    public ResponseEntity<InventoryResponse> updateStock(
            @PathVariable Long productId,
            @RequestBody InventoryRequest request
    ) {
        return ResponseEntity.ok(
                inventoryService.updateStock(productId, request)
        );
    }

    @GetMapping("/{productId}")
    public ResponseEntity<InventoryResponse> checkAvailability(
            @PathVariable Long productId
    ) {
        return ResponseEntity.ok(
                inventoryService.checkAvailability(productId)
        );
    }

    @PutMapping("/{productId}/reduce")
    public ResponseEntity<String> reduceStock(
            @PathVariable Long productId,
            @RequestParam Integer quantity
    ) {
        inventoryService.reduceStock(productId, quantity);
        return ResponseEntity.ok("Stock reduced successfully");
    }
}
