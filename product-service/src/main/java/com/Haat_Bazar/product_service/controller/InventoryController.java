package com.Haat_Bazar.product_service.controller;

import com.Haat_Bazar.product_service.exception.ResourceNotFoundException;
import com.Haat_Bazar.product_service.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final ProductRepository productRepository;

    @GetMapping("/{productId}")
    public Map<String, Object> getInventory(@PathVariable Long productId) {
        var product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return Map.of("productId", productId, "quantity", product.getStock() != null ? product.getStock() : 0);
    }

    @PutMapping("/{productId}/reduce")
    public Map<String, Object> reduceInventory(@PathVariable Long productId,
                                                @RequestParam int quantity) {
        var product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        int current = product.getStock() != null ? product.getStock() : 0;
        if (current < quantity) {
            throw new RuntimeException("Insufficient stock");
        }
        product.setStock(current - quantity);
        productRepository.save(product);
        return Map.of("productId", productId, "quantity", product.getStock());
    }
}