package com.gathercart.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "group_purchase")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupPurchase extends BaseEntity {

    @Column(name = "batch_code", nullable = false, unique = true, length = 50)
    private String batchCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "cluster_name", length = 100)
    private String clusterName;

    @Column(name = "target_quantity", nullable = false)
    private Integer targetQuantity;

    @Builder.Default
    @Column(name = "current_quantity", nullable = false)
    private Integer currentQuantity = 0;

    @Builder.Default
    @Column(name = "household_limit", nullable = false)
    private Integer householdLimit = 3;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private GroupPurchaseStatus status = GroupPurchaseStatus.OPEN;

    @Column(name = "deadline", nullable = false)
    private LocalDateTime deadline;

    @Builder.Default
    @Column(name = "payment_window_mins", nullable = false)
    private Integer paymentWindowMins = 10;

    @Column(name = "payment_deadline")
    private LocalDateTime paymentDeadline;

    @Column(name = "lead_organiser", length = 150)
    private String leadOrganiser;

    @Column(name = "hub_drop_location", length = 255)
    private String hubDropLocation;

    @Builder.Default
    @Column(name = "is_free_delivery", nullable = false)
    private Boolean isFreeDelivery = true;

    @Builder.Default
    @OneToMany(mappedBy = "groupPurchase", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GroupParticipant> participants = new ArrayList<>();
}
