package com.gathercart.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkPoolSuggestionRequest {

    @NotBlank(message = "Product name is required")
    @Size(min = 2, max = 150, message = "Product name must be between 2 and 150 characters")
    private String productName;

    @Size(max = 100)
    private String category;

    @Size(max = 150)
    private String clusterName;

    @Size(max = 500)
    private String notes;

    @Size(max = 20)
    private String contactPhone;
}
