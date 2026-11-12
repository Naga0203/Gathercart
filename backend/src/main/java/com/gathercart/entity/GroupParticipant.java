package com.gathercart.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
import java.time.LocalDateTime;

@Entity
@Table(name = "group_participant")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupParticipant extends BaseEntity {

    @Column(name = "commitment_code", nullable = false, unique = true, length = 50)
    private String commitmentCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_purchase_id", nullable = false)
    private GroupPurchase groupPurchase;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "location", length = 100)
    private String location;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "mrp_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal mrpTotal;

    @Column(name = "savings", nullable = false, precision = 10, scale = 2)
    private BigDecimal savings;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private GroupParticipantStatus status = GroupParticipantStatus.ACTIVE;

    @Column(name = "pledged_at", nullable = false)
    private LocalDateTime pledgedAt;

    @Column(name = "payment_due_at")
    private LocalDateTime paymentDueAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;
}
