package com.gathercart.dto;

import com.gathercart.entity.GroupParticipantStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupParticipantResponse {
    private Long id;
    private String commitmentCode;
    private Long groupPurchaseId;
    private String batchCode;
    private String displayName;
    private String initials;
    private String location;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalAmount;
    private BigDecimal mrpTotal;
    private BigDecimal savings;
    private GroupParticipantStatus status;
    private LocalDateTime pledgedAt;
    private String timeAgo;
    private Boolean isCurrentUser;
}

