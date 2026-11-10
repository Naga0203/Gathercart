package com.gathercart.controller;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthResponse {
    private String status;
    private String database;
    private String timestamp;

    public static HealthResponse of(String status, String database) {
        return HealthResponse.builder()
                .status(status)
                .database(database)
                .timestamp(Instant.now().toString())
                .build();
    }
}
