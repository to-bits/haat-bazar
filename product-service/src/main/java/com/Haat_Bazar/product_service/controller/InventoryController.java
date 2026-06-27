package com.Haat_Bazar.product_service.controller;

import com.Haat_Bazar.product_service.dto.InventoryRequest;
import com.Haat_Bazar.product_service.dto.InventoryResponse;
import com.Haat_Bazar.product_service.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    @PostMapping("/check-stock")
    public ResponseEntity<Map<String, Object>> checkBatchStock(
        @RequestBody List<Map<String, Object>> items) {
    List<Long> unavailable = new ArrayList<>();
    for (Map<String, Object> item : items) {
        Long productId = ((Number) item.get("product_id")).longValue();
        Integer required = (Integer) item.get("quantity");
        InventoryResponse inv = inventoryService.checkAvailability(productId);
        if (inv == null || inv.getQuantity() == null || inv.getQuantity() < required) {
            unavailable.add(productId);
        }
    }
    Map<String, Object> response = new HashMap<>();
    response.put("available", unavailable.isEmpty());
    response.put("unavailable_product_ids", unavailable);
    return ResponseEntity.ok(response);
        }

   @PostMapping("/reduce")
   public ResponseEntity<Void> reduceBatchStock(
        @RequestBody List<Map<String, Object>> items) {
      for (Map<String, Object> item : items) {
        Long productId = ((Number) item.get("product_id")).longValue();
        Integer quantity = (Integer) item.get("quantity");
        inventoryService.reduceStock(productId, quantity);
    }
    return ResponseEntity.ok().build();
    }
}
