package com.gathercart.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductRequest {

    @Size(min = 2, max = 200, message = "Product name must be between 2 and 200 characters")
    private String name;

    private String description;

    private String detailedDescription;

    private Long categoryId;

    private Long coopProfileId;

    @Size(max = 50, message = "Unit label must not exceed 50 characters")
    private String unitLabel;

    @DecimalMin(value = "0.01", message = "Unit weight in kg must be greater than 0")
    private BigDecimal unitWeightKg;

    @DecimalMin(value = "0.01", message = "MRP must be greater than 0")
    private BigDecimal mrp;

    @DecimalMin(value = "0.01", message = "Group price must be greater than 0")
    private BigDecimal groupPrice;

    private String imageUrl;

    private Boolean isLabVerified;

    private Boolean isPesticideTested;

    private String harvestDate;

    private String moistureLevel;

    private String grainType;

    private String processing;

    private String culinaryProfile;

    private String qualityMetrics;

    private Boolean isActive;

    private List<String> galleryImageUrls;
}

