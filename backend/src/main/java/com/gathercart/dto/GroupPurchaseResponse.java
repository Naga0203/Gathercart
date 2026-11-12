package com.gathercart.dto;

import com.gathercart.entity.GroupPurchaseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupPurchaseResponse {
    private Long id;
    private String batchCode;
    private ProductSummaryResponse product;
    private String clusterName;
    private Integer targetQuantity;
    private Integer currentQuantity;
    private Integer remainingQuantity;
    private Integer progressPercent;
    private Integer householdLimit;
    private GroupPurchaseStatus status;
    private LocalDateTime deadline;
    private Integer paymentWindowMins;
    private LocalDateTime paymentDeadline;
    private String leadOrganiser;
    private String hubDropLocation;
    private Boolean isFreeDelivery;
    private String contextMessage;
    private Integer totalParticipants;
    private List<GroupParticipantResponse> recentParticipants;
}

