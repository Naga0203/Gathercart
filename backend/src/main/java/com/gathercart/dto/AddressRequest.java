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
public class AddressRequest {

    @Size(max = 50)
    private String label;

    @NotBlank(message = "Address line 1 is required")
    @Size(max = 300)
    private String addressLine1;

    @Size(max = 300)
    private String addressLine2;

    @NotBlank(message = "Pincode is required")
    @Size(min = 5, max = 10)
    private String pincode;

    private Boolean isDefault;
}
