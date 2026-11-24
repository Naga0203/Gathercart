package com.gathercart.controller;

import com.gathercart.common.ApiResponse;
import com.gathercart.dto.CreateGroupPurchaseRequest;
import com.gathercart.dto.GroupParticipantResponse;
import com.gathercart.dto.GroupPurchaseResponse;
import com.gathercart.dto.JoinGroupRequest;
import com.gathercart.dto.PageResponse;
import com.gathercart.dto.UpdatePledgeQuantityRequest;
import com.gathercart.entity.GroupPurchaseStatus;
import com.gathercart.entity.User;
import com.gathercart.security.CurrentUser;
import com.gathercart.service.GroupPurchaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/batches", "/group-purchases"})
@RequiredArgsConstructor
@Slf4j
public class GroupPurchaseController {

    private final GroupPurchaseService groupPurchaseService;
    private final CurrentUser currentUser;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<GroupPurchaseResponse>>> getBatches(
            @RequestParam(required = false) GroupPurchaseStatus status,
            @RequestParam(required = false) String filter,
            @RequestParam(required = false) Long categoryId,
            Pageable pageable
    ) {
        PageResponse<GroupPurchaseResponse> response = groupPurchaseService.getGroupPurchases(
                status, filter, categoryId, pageable
        );
        return ResponseEntity.ok(ApiResponse.success(response, "Batches retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GroupPurchaseResponse>> getBatchById(@PathVariable Long id) {
        GroupPurchaseResponse response = groupPurchaseService.getGroupPurchaseById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Batch retrieved successfully"));
    }

    @GetMapping("/by-product/{productId}")
    public ResponseEntity<ApiResponse<GroupPurchaseResponse>> getActiveBatchByProductId(@PathVariable Long productId) {
        GroupPurchaseResponse response = groupPurchaseService.getActiveGroupByProductId(productId);
        return ResponseEntity.ok(ApiResponse.success(response, "Active batch retrieved successfully"));
    }

    @GetMapping("/{id}/participants")
    public ResponseEntity<ApiResponse<List<GroupParticipantResponse>>> getParticipants(@PathVariable Long id) {
        List<GroupParticipantResponse> participants = groupPurchaseService.getParticipants(id);
        return ResponseEntity.ok(ApiResponse.success(participants, "Participants retrieved successfully"));
    }

    @GetMapping("/my-pledges")
    public ResponseEntity<ApiResponse<List<GroupParticipantResponse>>> getMyPledges() {
        User user = currentUser.require();
        List<GroupParticipantResponse> myPledges = groupPurchaseService.getUserParticipations(user.getId());
        return ResponseEntity.ok(ApiResponse.success(myPledges, "My pledges retrieved successfully"));
    }

    @PostMapping("/{id}/pledge")
    public ResponseEntity<ApiResponse<GroupParticipantResponse>> joinBatch(
            @PathVariable Long id,
            @Valid @RequestBody JoinGroupRequest request
    ) {
        User user = currentUser.require();
        request.setUserId(user.getId());
        if (request.getDisplayName() == null || request.getDisplayName().isBlank()) {
            request.setDisplayName(user.getFullName());
        }
        if (request.getPhone() == null || request.getPhone().isBlank()) {
            request.setPhone(user.getPhone() != null && !user.getPhone().isBlank() ? user.getPhone() : "+919876543210");
        }

        GroupParticipantResponse response = groupPurchaseService.joinGroup(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Pledge confirmed successfully"));
    }

    @PatchMapping("/pledges/{participantId}")
    public ResponseEntity<ApiResponse<GroupParticipantResponse>> updatePledgeQuantity(
            @PathVariable Long participantId,
            @Valid @RequestBody UpdatePledgeQuantityRequest request
    ) {
        User user = currentUser.require();
        GroupParticipantResponse response = groupPurchaseService.updateQuantity(
                participantId, request.getQuantity(), user.getId()
        );
        return ResponseEntity.ok(ApiResponse.success(response, "Pledge quantity updated successfully"));
    }

    @DeleteMapping("/pledges/{participantId}")
    public ResponseEntity<ApiResponse<Void>> cancelPledge(@PathVariable Long participantId) {
        User user = currentUser.require();
        groupPurchaseService.cancelParticipation(participantId, user.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Pledge cancelled successfully"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<GroupPurchaseResponse>> createBatch(
            @Valid @RequestBody CreateGroupPurchaseRequest request
    ) {
        GroupPurchaseResponse response = groupPurchaseService.createGroupPurchase(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Batch created successfully"));
    }
}

