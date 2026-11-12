package com.gathercart.service;

import com.gathercart.dto.CategoryResponse;
import com.gathercart.entity.Category;
import com.gathercart.exception.BusinessException;
import com.gathercart.exception.ResourceNotFoundException;
import com.gathercart.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllActiveCategories() {
        return categoryRepository.findAllByIsActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Category getCategoryEntity(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
    }

    @Transactional
    public CategoryResponse createCategory(String name, String icon, Integer displayOrder) {
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new BusinessException("Category with name '" + name + "' already exists");
        }
        Category category = Category.builder()
                .name(name.trim())
                .icon(icon)
                .displayOrder(displayOrder != null ? displayOrder : 0)
                .isActive(true)
                .build();
        return CategoryResponse.fromEntity(categoryRepository.save(category));
    }
}

