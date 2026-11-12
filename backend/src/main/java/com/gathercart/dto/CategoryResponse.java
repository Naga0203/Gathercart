package com.gathercart.dto;

import com.gathercart.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private Long id;
    private String name;
    private String icon;
    private Integer displayOrder;

    public static CategoryResponse fromEntity(Category category) {
        if (category == null) return null;
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .icon(category.getIcon())
                .displayOrder(category.getDisplayOrder())
                .build();
    }
}

