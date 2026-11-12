package com.gathercart.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateGroupPurchaseRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Target quantity is required")
    @Min(value = 1, message = "Target quantity must be at least 1")
    private Integer targetQuantity;

    @Builder.Default
    @Min(value = 1, message = "Household limit must be at least 1")
    private Integer householdLimit = 3;

    @NotNull(message = "Closing deadline is required")
    @Future(message = "Deadline must be in the future")
    private LocalDateTime deadline;

    private String clusterName;

    private String leadOrganiser;

    private String hubDropLocation;
}

