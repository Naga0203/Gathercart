package com.gathercart.dto;

import com.gathercart.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSummaryResponse {
    private Long id;
    private String name;
    private String description;
    private String unitLabel;
    private BigDecimal unitWeightKg;
    private BigDecimal mrp;
    private BigDecimal groupPrice;
    private BigDecimal savingsAmount;
    private Integer savingsPercent;
    private String imageUrl;
    private Long categoryId;
    private String categoryName;
    private Boolean isLabVerified;
    private Boolean isPesticideTested;
    private Boolean isActive;

    public static ProductSummaryResponse fromEntity(Product product) {
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

        return ProductSummaryResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .unitLabel(product.getUnitLabel())
                .unitWeightKg(product.getUnitWeightKg())
                .mrp(product.getMrp())
                .groupPrice(product.getGroupPrice())
                .savingsAmount(savingsAmount)
                .savingsPercent(savingsPercent)
                .imageUrl(product.getImageUrl())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .isLabVerified(product.getIsLabVerified())
                .isPesticideTested(product.getIsPesticideTested())
                .isActive(product.getIsActive())
                .build();
    }
}

