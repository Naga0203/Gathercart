package com.gathercart.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
                "application", "GatherCart Backend API",
                "status", "UP",
                "version", "1.0.0",
                "health", "/api/v1/health",
                "timestamp", Instant.now().toString()
        ));
    }
}

