package com.gathercart.dto;

import com.gathercart.entity.CoopProfile;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoopProfileResponse {
    private Long id;
    private String coopIdCode;
    private String name;
    private String location;
    private String description;
    private Boolean isVerified;

    public static CoopProfileResponse fromEntity(CoopProfile coopProfile) {
        if (coopProfile == null) return null;
        return CoopProfileResponse.builder()
                .id(coopProfile.getId())
                .coopIdCode(coopProfile.getCoopIdCode())
                .name(coopProfile.getName())
                .location(coopProfile.getLocation())
                .description(coopProfile.getDescription())
                .isVerified(coopProfile.getIsVerified())
                .build();
    }
}

