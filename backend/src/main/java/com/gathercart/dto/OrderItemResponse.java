package com.gathercart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String unitLabel;
    private String imageUrl;
    private Integer quantity;
    private BigDecimal mrpUnitPrice;
    private BigDecimal appliedUnitPrice;
    private BigDecimal itemSubtotal;
    private BigDecimal savingsAmount;
    private Integer savingsPercent;
}

