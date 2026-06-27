package com.Haat_Bazar.product_service.service;

import com.Haat_Bazar.product_service.dto.CategoryRequest;
import com.Haat_Bazar.product_service.dto.CategoryResponse;

import java.util.List;

public interface CategoryService {

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse getCategory(Long id);

    List<CategoryResponse> getAllCategories();

    CategoryResponse updateCategory(Long id, CategoryRequest request);

    void deleteCategory(Long id);
}
