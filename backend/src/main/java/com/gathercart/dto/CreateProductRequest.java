package com.gathercart.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreateProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(min = 2, max = 200, message = "Product name must be between 2 and 200 characters")
    private String name;

    private String description;

    private String detailedDescription;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    private Long coopProfileId;

    @NotBlank(message = "Unit label is required (e.g., '10 kg bag')")
    @Size(max = 50, message = "Unit label must not exceed 50 characters")
    private String unitLabel;

    @DecimalMin(value = "0.01", message = "Unit weight in kg must be greater than 0")
    private BigDecimal unitWeightKg;

    @NotNull(message = "MRP is required")
    @DecimalMin(value = "0.01", message = "MRP must be greater than 0")
    private BigDecimal mrp;

    @NotNull(message = "Group price is required")
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

    private List<String> galleryImageUrls;
}

