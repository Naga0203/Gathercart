package com.gathercart.controller;

import com.gathercart.common.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;

@RestController
public class HealthController {

    @Autowired(required = false)
    private DataSource dataSource;

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<HealthResponse>> checkHealth() {
        String dbStatus = "Not Connected";
        if (dataSource != null) {
            try (Connection conn = dataSource.getConnection()) {
                if (conn.isValid(3)) {
                    dbStatus = "Connected (Supabase PostgreSQL: " + conn.getMetaData().getDatabaseProductName() + " " + conn.getMetaData().getDatabaseProductVersion() + ")";
                }
            } catch (Exception e) {
                dbStatus = "Configured / Awaiting valid Supabase credentials (" + e.getMessage() + ")";
            }
        }

        HealthResponse health = HealthResponse.of("UP", dbStatus);
        return ResponseEntity.ok(ApiResponse.success(health, "GatherCart API is operational"));
    }
}
