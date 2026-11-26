package com.gathercart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkPoolSuggestionResponse {

    private Long id;
    private String productName;
    private String category;
    private String clusterName;
    private String notes;
    private String status;
    private LocalDateTime createdAt;
}
