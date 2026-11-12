package com.gathercart.dto;

import com.gathercart.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDetailResponse {
    private Long id;
    private String name;
    private String description;
    private String detailedDescription;
    private String unitLabel;
    private BigDecimal unitWeightKg;
    private BigDecimal mrp;
    private BigDecimal groupPrice;
    private BigDecimal savingsAmount;
    private Integer savingsPercent;
    private String imageUrl;
    private List<ProductImageResponse> images;
    private Long categoryId;
    private String categoryName;
    private Boolean isLabVerified;
    private Boolean isPesticideTested;
    private String harvestDate;
    private String moistureLevel;
    private String grainType;
    private String processing;
    private String culinaryProfile;
    private String qualityMetrics;
    private Boolean isActive;
    private CoopProfileResponse coopProfile;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProductDetailResponse fromEntity(Product product) {
        if (product == null) return null;

        BigDecimal savingsAmount = BigDecimal.ZERO;
        int savingsPercent = 0;

        if (product.getMrp() != null && product.getGroupPrice() != null) {
            savingsAmount = product.getMrp().subtract(product.getGroupPrice());
            if (product.getMrp().compareTo(BigDecimal.ZERO) > 0) {
                savingsPercent = savingsAmount
                        .multiply(BigDecimal.valueOf(100))
                        .divide(product.getMrp(), 0, RoundingMode.HALF_UP)
                        .intValue();
            }
        }

        List<ProductImageResponse> imageResponses = product.getImages() != null
                ? product.getImages().stream().map(ProductImageResponse::fromEntity).collect(Collectors.toList())
                : Collections.emptyList();

        return ProductDetailResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .detailedDescription(product.getDetailedDescription())
                .unitLabel(product.getUnitLabel())
                .unitWeightKg(product.getUnitWeightKg())
                .mrp(product.getMrp())
                .groupPrice(product.getGroupPrice())
                .savingsAmount(savingsAmount)
                .savingsPercent(savingsPercent)
                .imageUrl(product.getImageUrl())
                .images(imageResponses)
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .isLabVerified(product.getIsLabVerified())
                .isPesticideTested(product.getIsPesticideTested())
                .harvestDate(product.getHarvestDate())
                .moistureLevel(product.getMoistureLevel())
                .grainType(product.getGrainType())
                .processing(product.getProcessing())
                .culinaryProfile(product.getCulinaryProfile())
                .qualityMetrics(product.getQualityMetrics())
                .isActive(product.getIsActive())
                .coopProfile(CoopProfileResponse.fromEntity(product.getCoopProfile()))
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}

