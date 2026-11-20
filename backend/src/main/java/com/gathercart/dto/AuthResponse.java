package com.gathercart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private String clusterName;
    private String token;
}
