package com.gathercart.dto;

import com.gathercart.entity.ProductImage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductImageResponse {
    private Long id;
    private String imageUrl;
    private Integer displayOrder;
    private Boolean isVerified;

    public static ProductImageResponse fromEntity(ProductImage image) {
        if (image == null) return null;
        return ProductImageResponse.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .displayOrder(image.getDisplayOrder())
                .isVerified(image.getIsVerified())
                .build();
    }
}

