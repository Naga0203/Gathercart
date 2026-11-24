package com.gathercart.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "customer_order_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    @Column(name = "unit_label", length = 50)
    private String unitLabel;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "mrp_unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal mrpUnitPrice;

    @Column(name = "applied_unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal appliedUnitPrice;

    @Column(name = "item_subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal itemSubtotal;

    @Column(name = "savings_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal savingsAmount;

    @Column(name = "savings_percent")
    private Integer savingsPercent;
}

