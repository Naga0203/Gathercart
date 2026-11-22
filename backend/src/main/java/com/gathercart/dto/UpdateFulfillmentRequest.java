package com.gathercart.dto;

import com.gathercart.entity.FulfillmentType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateFulfillmentRequest {

    @NotNull(message = "Fulfillment type is required")
    private FulfillmentType fulfillmentType;

    private String deliveryAddress;
}

