package com.gathercart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {

    private Long id;
    private Long userId;
    private String sessionId;
    private Long clusterId;

    @Builder.Default
    private List<CartItemResponse> items = new ArrayList<>();

    private Integer totalItems;
    private Integer itemCount;

    private BigDecimal mrpSubtotal;
    private BigDecimal subtotal;
    private BigDecimal applicableDiscounts;
    private BigDecimal estimatedSavings;
    private BigDecimal deliveryFee;
    private BigDecimal finalEstimatedTotal;
    private String deliveryNote;
}
