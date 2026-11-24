package com.gathercart.dto;

import com.gathercart.entity.FulfillmentType;
import com.gathercart.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private Long userId;
    private Long clusterId;
    private FulfillmentType fulfillmentType;
    private String deliveryAddress;
    private OrderStatus status;
    private BigDecimal mrpSubtotal;
    private BigDecimal discountAmount;
    private BigDecimal subtotal;
    private BigDecimal deliveryFee;
    private BigDecimal finalTotal;
    private String paymentMethod;
    private String paymentStatus;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

