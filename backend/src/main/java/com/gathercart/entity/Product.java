package com.gathercart.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "product")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product extends BaseEntity {

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "detailed_description", columnDefinition = "text")
    private String detailedDescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coop_profile_id")
    private CoopProfile coopProfile;

    @Column(name = "unit_label", nullable = false, length = 50)
    private String unitLabel;

    @Column(name = "unit_weight_kg", precision = 8, scale = 2)
    private BigDecimal unitWeightKg;

    @Column(name = "mrp", nullable = false, precision = 10, scale = 2)
    private BigDecimal mrp;

    @Column(name = "group_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal groupPrice;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "is_lab_verified", nullable = false)
    @Builder.Default
    private Boolean isLabVerified = false;

    @Column(name = "is_pesticide_tested", nullable = false)
    @Builder.Default
    private Boolean isPesticideTested = false;

    @Column(name = "harvest_date", length = 50)
    private String harvestDate;

    @Column(name = "moisture_level", length = 50)
    private String moistureLevel;

    @Column(name = "grain_type", length = 50)
    private String grainType;

    @Column(name = "processing", length = 100)
    private String processing;

    @Column(name = "culinary_profile", columnDefinition = "TEXT")
    private String culinaryProfile;

    @Column(name = "quality_metrics", columnDefinition = "TEXT")
    private String qualityMetrics;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();

    public void addImage(ProductImage image) {
        images.add(image);
        image.setProduct(this);
    }

    public void removeImage(ProductImage image) {
        images.remove(image);
        image.setProduct(null);
    }
}

