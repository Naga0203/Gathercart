package com.gathercart.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "bulk_pool_suggestion")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkPoolSuggestion extends BaseEntity {

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "product_name", nullable = false, length = 150)
    private String productName;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "cluster_name", length = 150)
    private String clusterName;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Builder.Default
    @Column(name = "status", nullable = false, length = 30)
    private String status = "PENDING";
}
