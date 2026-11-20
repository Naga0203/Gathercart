package com.gathercart.service;

import com.gathercart.dto.CreateGroupPurchaseRequest;
import com.gathercart.dto.GroupParticipantResponse;
import com.gathercart.dto.GroupPurchaseResponse;
import com.gathercart.dto.JoinGroupRequest;
import com.gathercart.dto.PageResponse;
import com.gathercart.dto.ProductSummaryResponse;
import com.gathercart.entity.GroupParticipant;
import com.gathercart.entity.GroupParticipantStatus;
import com.gathercart.entity.GroupPurchase;
import com.gathercart.entity.GroupPurchaseStatus;
import com.gathercart.entity.Product;
import com.gathercart.exception.BusinessException;
import com.gathercart.exception.ResourceNotFoundException;
import com.gathercart.repository.GroupParticipantRepository;
import com.gathercart.repository.GroupPurchaseRepository;
import com.gathercart.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GroupPurchaseService {

    private final GroupPurchaseRepository groupPurchaseRepository;
    private final GroupParticipantRepository groupParticipantRepository;
    private final ProductRepository productRepository;
    private final Random random = new Random();

    @Transactional
    public GroupPurchaseResponse createGroupPurchase(CreateGroupPurchaseRequest request) {
        log.info("Creating new group purchase for productId: {}", request.getProductId());

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + request.getProductId()));

        String batchCode = "GP-" + String.format("%04d", random.nextInt(10000)) + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        GroupPurchase groupPurchase = GroupPurchase.builder()
                .batchCode(batchCode)
                .product(product)
                .clusterName(request.getClusterName() != null ? request.getClusterName() : "Community Hub")
                .targetQuantity(request.getTargetQuantity())
                .currentQuantity(0)
                .householdLimit(request.getHouseholdLimit() != null ? request.getHouseholdLimit() : 3)
                .status(GroupPurchaseStatus.OPEN)
                .deadline(request.getDeadline())
                .paymentWindowMins(10)
                .leadOrganiser(request.getLeadOrganiser())
                .hubDropLocation(request.getHubDropLocation())
                .isFreeDelivery(true)
                .participants(new ArrayList<>())
                .build();

        GroupPurchase saved = groupPurchaseRepository.save(groupPurchase);
        log.info("Created group purchase batch {} with ID: {}", saved.getBatchCode(), saved.getId());
        return mapToGroupPurchaseResponse(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<GroupPurchaseResponse> getGroupPurchases(
            GroupPurchaseStatus status,
            String filter,
            Long categoryId,
            Pageable pageable
    ) {
        if (pageable == null) {
            pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        }

        GroupPurchaseStatus effectiveStatus = status;
        if (effectiveStatus == null && filter != null && !filter.isBlank()) {
            try {
                effectiveStatus = GroupPurchaseStatus.valueOf(filter.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // filter is a text search string, not a status enum
            }
        }

        Page<GroupPurchase> page;
        if (effectiveStatus != null) {
            page = groupPurchaseRepository.findByStatus(effectiveStatus, pageable);
        } else {
            page = groupPurchaseRepository.findAll(pageable);
        }

        List<GroupPurchase> list = page.getContent();
        if (categoryId != null) {
            list = list.stream()
                    .filter(gp -> gp.getProduct() != null &&
                            gp.getProduct().getCategory() != null &&
                            categoryId.equals(gp.getProduct().getCategory().getId()))
                    .collect(Collectors.toList());
        }

        if (filter != null && !filter.isBlank() && effectiveStatus == null) {
            String lowerFilter = filter.trim().toLowerCase();
            list = list.stream()
                    .filter(gp -> (gp.getProduct() != null && gp.getProduct().getName() != null && gp.getProduct().getName().toLowerCase().contains(lowerFilter)) ||
                            (gp.getClusterName() != null && gp.getClusterName().toLowerCase().contains(lowerFilter)) ||
                            (gp.getBatchCode() != null && gp.getBatchCode().toLowerCase().contains(lowerFilter)))
                    .collect(Collectors.toList());
        }

        List<GroupPurchaseResponse> responses = list.stream()
                .map(this::mapToGroupPurchaseResponse)
                .collect(Collectors.toList());

        return PageResponse.from(page, responses);
    }

    @Transactional(readOnly = true)
    public GroupPurchaseResponse getGroupPurchaseById(Long id) {
        GroupPurchase groupPurchase = groupPurchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Group purchase not found with ID: " + id));
        return mapToGroupPurchaseResponse(groupPurchase);
    }

    @Transactional(readOnly = true)
    public GroupPurchaseResponse getActiveGroupByProductId(Long productId) {
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        List<GroupPurchase> activeList = groupPurchaseRepository.findActiveByProductId(productId);
        if (activeList == null || activeList.isEmpty()) {
            throw new ResourceNotFoundException("No active group purchase found for product ID: " + productId);
        }
        return mapToGroupPurchaseResponse(activeList.get(0));
    }

    @Transactional
    public GroupParticipantResponse joinGroup(Long groupPurchaseId, JoinGroupRequest request) {
        log.info("User/phone {} attempting to join group purchase {}", request.getPhone(), groupPurchaseId);

        // Pessimistic lock
        GroupPurchase groupPurchase = groupPurchaseRepository.findByIdWithLock(groupPurchaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Group purchase not found with ID: " + groupPurchaseId));

        if (groupPurchase.getStatus() != GroupPurchaseStatus.OPEN) {
            throw new BusinessException("Group purchase is not open for pledges (status: " + groupPurchase.getStatus() + ")");
        }
        if (groupPurchase.getDeadline() != null && !LocalDateTime.now().isBefore(groupPurchase.getDeadline())) {
            throw new BusinessException("Group purchase deadline has passed");
        }

        // Ownership enforcement: userId is required for joining
        if (request.getUserId() == null) {
            throw new BusinessException("User ID is required for joining a group purchase");
        }

        // Duplicate active pledge validation
        boolean duplicatePhone = groupParticipantRepository.findByGroupPurchaseIdAndPhoneAndStatus(
                groupPurchaseId, request.getPhone(), GroupParticipantStatus.ACTIVE).isPresent();
        boolean duplicateUser = request.getUserId() != null && groupParticipantRepository.findByGroupPurchaseIdAndUserIdAndStatus(
                groupPurchaseId, request.getUserId(), GroupParticipantStatus.ACTIVE).isPresent();
        if (duplicatePhone || duplicateUser) {
            throw new BusinessException("You already have an active pledge in this group. Please update your existing pledge.");
        }

        // Household limit validation
        Integer phoneQty = groupParticipantRepository.sumQuantityByGroupPurchaseIdAndPhone(groupPurchaseId, request.getPhone());
        int currentPhoneTotal = (phoneQty != null) ? phoneQty : 0;
        if (currentPhoneTotal + request.getQuantity() > groupPurchase.getHouseholdLimit()) {
            throw new BusinessException("Requested quantity exceeds household limit of " + groupPurchase.getHouseholdLimit());
        }

        // Remaining capacity validation
        int remainingCapacity = groupPurchase.getTargetQuantity() - groupPurchase.getCurrentQuantity();
        if (request.getQuantity() > remainingCapacity) {
            throw new BusinessException("Requested quantity (" + request.getQuantity() + ") exceeds remaining capacity of " + remainingCapacity);
        }

        // Authoritative calculations
        Product product = groupPurchase.getProduct();
        BigDecimal unitPrice = product.getGroupPrice();
        BigDecimal totalAmount = unitPrice.multiply(BigDecimal.valueOf(request.getQuantity()));
        BigDecimal mrpTotal = product.getMrp().multiply(BigDecimal.valueOf(request.getQuantity()));
        BigDecimal savings = mrpTotal.subtract(totalAmount);

        // Commitment code format
        String productName = (product.getName() != null && !product.getName().isBlank()) ? product.getName() : "PROD";
        String firstWord = productName.trim().split("\\s+")[0].replaceAll("[^a-zA-Z0-9]", "").toUpperCase();
        if (firstWord.isEmpty()) firstWord = "PROD";
        String commitmentCode = "NB-CMT-" + String.format("%04d", random.nextInt(10000)) + "-" + firstWord;

        GroupParticipant participant = GroupParticipant.builder()
                .commitmentCode(commitmentCode)
                .groupPurchase(groupPurchase)
                .userId(request.getUserId())
                .displayName(request.getDisplayName() != null ? request.getDisplayName() : "Neighbor")
                .phone(request.getPhone())
                .location(request.getLocation())
                .quantity(request.getQuantity())
                .unitPrice(unitPrice)
                .totalAmount(totalAmount)
                .mrpTotal(mrpTotal)
                .savings(savings)
                .status(GroupParticipantStatus.ACTIVE)
                .pledgedAt(LocalDateTime.now())
                .build();

        groupPurchase.setCurrentQuantity(groupPurchase.getCurrentQuantity() + request.getQuantity());

        // Status automation: target quantity reached
        if (groupPurchase.getCurrentQuantity().equals(groupPurchase.getTargetQuantity())) {
            log.info("Group purchase {} reached target quantity {}. Transitioning to CONFIRMED.", groupPurchase.getId(), groupPurchase.getTargetQuantity());
            groupPurchase.setStatus(GroupPurchaseStatus.CONFIRMED);
            int windowMins = groupPurchase.getPaymentWindowMins() != null ? groupPurchase.getPaymentWindowMins() : 10;
            LocalDateTime paymentDeadline = LocalDateTime.now().plusMinutes(windowMins);
            groupPurchase.setPaymentDeadline(paymentDeadline);

            List<GroupParticipant> activeParticipants = groupParticipantRepository
                    .findByGroupPurchaseIdAndStatusOrderByPledgedAtDesc(groupPurchaseId, GroupParticipantStatus.ACTIVE);
            for (GroupParticipant p : activeParticipants) {
                p.setStatus(GroupParticipantStatus.PAYMENT_PENDING);
                p.setPaymentDueAt(paymentDeadline);
                groupParticipantRepository.save(p);
            }

            participant.setStatus(GroupParticipantStatus.PAYMENT_PENDING);
            participant.setPaymentDueAt(paymentDeadline);
        }

        participant = groupParticipantRepository.save(participant);
        groupPurchaseRepository.save(groupPurchase);

        return mapToParticipantResponse(participant);
    }

    @Transactional
    public GroupParticipantResponse updateQuantity(Long participantId, int newQuantity) {
        if (newQuantity <= 0) {
            throw new BusinessException("Quantity must be at least 1");
        }

        GroupParticipant participant = groupParticipantRepository.findById(participantId)
                .orElseThrow(() -> new ResourceNotFoundException("Group participant not found with ID: " + participantId));

        final Long groupPurchaseId = participant.getGroupPurchase().getId();
        GroupPurchase groupPurchase = groupPurchaseRepository.findByIdWithLock(groupPurchaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Group purchase not found with ID: " + groupPurchaseId));

        if (groupPurchase.getStatus() != GroupPurchaseStatus.OPEN) {
            throw new BusinessException("Group purchase is not open for updates (status: " + groupPurchase.getStatus() + ")");
        }
        if (groupPurchase.getDeadline() != null && !LocalDateTime.now().isBefore(groupPurchase.getDeadline())) {
            throw new BusinessException("Group purchase deadline has passed");
        }
        if (participant.getStatus() != GroupParticipantStatus.ACTIVE) {
            throw new BusinessException("Cannot update quantity for pledge in status: " + participant.getStatus());
        }

        int delta = newQuantity - participant.getQuantity();
        if (delta != 0) {
            if (delta > 0) {
                Integer phoneQty = groupParticipantRepository.sumQuantityByGroupPurchaseIdAndPhone(groupPurchase.getId(), participant.getPhone());
                int currentPhoneTotal = (phoneQty != null) ? phoneQty : 0;
                if (currentPhoneTotal + delta > groupPurchase.getHouseholdLimit()) {
                    throw new BusinessException("Updated quantity exceeds household limit of " + groupPurchase.getHouseholdLimit());
                }
                int remainingCapacity = groupPurchase.getTargetQuantity() - groupPurchase.getCurrentQuantity();
                if (delta > remainingCapacity) {
                    throw new BusinessException("Requested quantity delta (" + delta + ") exceeds remaining capacity of " + remainingCapacity);
                }
            }

            groupPurchase.setCurrentQuantity(groupPurchase.getCurrentQuantity() + delta);
            participant.setQuantity(newQuantity);

            Product product = groupPurchase.getProduct();
            participant.setUnitPrice(product.getGroupPrice());
            participant.setTotalAmount(product.getGroupPrice().multiply(BigDecimal.valueOf(newQuantity)));
            participant.setMrpTotal(product.getMrp().multiply(BigDecimal.valueOf(newQuantity)));
            participant.setSavings(participant.getMrpTotal().subtract(participant.getTotalAmount()));

            if (groupPurchase.getCurrentQuantity().equals(groupPurchase.getTargetQuantity())) {
                groupPurchase.setStatus(GroupPurchaseStatus.CONFIRMED);
                int windowMins = groupPurchase.getPaymentWindowMins() != null ? groupPurchase.getPaymentWindowMins() : 10;
                LocalDateTime paymentDeadline = LocalDateTime.now().plusMinutes(windowMins);
                groupPurchase.setPaymentDeadline(paymentDeadline);

                List<GroupParticipant> activeParticipants = groupParticipantRepository
                        .findByGroupPurchaseIdAndStatusOrderByPledgedAtDesc(groupPurchase.getId(), GroupParticipantStatus.ACTIVE);
                for (GroupParticipant p : activeParticipants) {
                    if (!p.getId().equals(participant.getId())) {
                        p.setStatus(GroupParticipantStatus.PAYMENT_PENDING);
                        p.setPaymentDueAt(paymentDeadline);
                        groupParticipantRepository.save(p);
                    }
                }

                participant.setStatus(GroupParticipantStatus.PAYMENT_PENDING);
                participant.setPaymentDueAt(paymentDeadline);
            }

            groupPurchaseRepository.save(groupPurchase);
            participant = groupParticipantRepository.save(participant);
        }

        return mapToParticipantResponse(participant);
    }

    @Transactional
    public void cancelParticipation(Long participantId) {
        GroupParticipant participant = groupParticipantRepository.findById(participantId)
                .orElseThrow(() -> new ResourceNotFoundException("Group participant not found with ID: " + participantId));

        final Long groupPurchaseId = participant.getGroupPurchase().getId();
        GroupPurchase groupPurchase = groupPurchaseRepository.findByIdWithLock(groupPurchaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Group purchase not found with ID: " + groupPurchaseId));

        if (participant.getStatus() == GroupParticipantStatus.CANCELLED) {
            throw new BusinessException("Pledge is already cancelled");
        }
        if (participant.getStatus() != GroupParticipantStatus.ACTIVE && participant.getStatus() != GroupParticipantStatus.PAYMENT_PENDING) {
            throw new BusinessException("Cannot cancel pledge with status: " + participant.getStatus());
        }
        if (groupPurchase.getDeadline() != null && !LocalDateTime.now().isBefore(groupPurchase.getDeadline())) {
            throw new BusinessException("Cannot cancel after deadline has passed");
        }

        int participantQty = participant.getQuantity();
        groupPurchase.setCurrentQuantity(Math.max(0, groupPurchase.getCurrentQuantity() - participantQty));

        participant.setStatus(GroupParticipantStatus.CANCELLED);
        participant.setCancelledAt(LocalDateTime.now());
        groupParticipantRepository.save(participant);

        if (groupPurchase.getStatus() == GroupPurchaseStatus.CONFIRMED &&
                groupPurchase.getCurrentQuantity() < groupPurchase.getTargetQuantity()) {
            if (groupPurchase.getDeadline() == null || LocalDateTime.now().isBefore(groupPurchase.getDeadline())) {
                groupPurchase.setStatus(GroupPurchaseStatus.OPEN);
                groupPurchase.setPaymentDeadline(null);

                List<GroupParticipant> pendingParticipants = groupParticipantRepository
                        .findByGroupPurchaseIdAndStatusOrderByPledgedAtDesc(groupPurchase.getId(), GroupParticipantStatus.PAYMENT_PENDING);
                for (GroupParticipant p : pendingParticipants) {
                    if (!p.getId().equals(participant.getId())) {
                        p.setStatus(GroupParticipantStatus.ACTIVE);
                        p.setPaymentDueAt(null);
                        groupParticipantRepository.save(p);
                    }
                }
            }
        }

        groupPurchaseRepository.save(groupPurchase);
        log.info("Participant {} cancelled. Group {} quantity reduced by {} to {}",
                participantId, groupPurchase.getId(), participantQty, groupPurchase.getCurrentQuantity());
    }

    @Transactional(readOnly = true)
    public List<GroupParticipantResponse> getParticipants(Long groupPurchaseId) {
        GroupPurchase groupPurchase = groupPurchaseRepository.findById(groupPurchaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Group purchase not found with ID: " + groupPurchaseId));

        List<GroupParticipant> list;
        if (groupPurchase.getParticipants() != null && !groupPurchase.getParticipants().isEmpty()) {
            list = groupPurchase.getParticipants().stream()
                    .sorted(Comparator.comparing(GroupParticipant::getPledgedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                    .collect(Collectors.toList());
        } else {
            List<GroupParticipant> active = groupParticipantRepository
                    .findByGroupPurchaseIdAndStatusOrderByPledgedAtDesc(groupPurchaseId, GroupParticipantStatus.ACTIVE);
            List<GroupParticipant> pending = groupParticipantRepository
                    .findByGroupPurchaseIdAndStatusOrderByPledgedAtDesc(groupPurchaseId, GroupParticipantStatus.PAYMENT_PENDING);
            List<GroupParticipant> combined = new ArrayList<>(active);
            combined.addAll(pending);
            combined.sort(Comparator.comparing(GroupParticipant::getPledgedAt, Comparator.nullsLast(Comparator.reverseOrder())));
            list = combined;
        }

        return list.stream()
                .map(this::mapToParticipantResponse)
                .collect(Collectors.toList());
    }

    public GroupPurchaseResponse mapToGroupPurchaseResponse(GroupPurchase gp) {
        if (gp == null) return null;

        int target = gp.getTargetQuantity() != null ? gp.getTargetQuantity() : 0;
        int current = gp.getCurrentQuantity() != null ? gp.getCurrentQuantity() : 0;
        int remaining = Math.max(0, target - current);
        int progressPercent = target > 0 ? (current * 100) / target : 0;

        List<GroupParticipant> nonCancelled;
        if (gp.getParticipants() != null && !gp.getParticipants().isEmpty()) {
            nonCancelled = gp.getParticipants().stream()
                    .filter(p -> p.getStatus() != GroupParticipantStatus.CANCELLED)
                    .sorted(Comparator.comparing(GroupParticipant::getPledgedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                    .collect(Collectors.toList());
        } else if (gp.getId() != null) {
            List<GroupParticipant> active = groupParticipantRepository
                    .findByGroupPurchaseIdAndStatusOrderByPledgedAtDesc(gp.getId(), GroupParticipantStatus.ACTIVE);
            List<GroupParticipant> pending = groupParticipantRepository
                    .findByGroupPurchaseIdAndStatusOrderByPledgedAtDesc(gp.getId(), GroupParticipantStatus.PAYMENT_PENDING);
            List<GroupParticipant> combined = new ArrayList<>(active);
            combined.addAll(pending);
            combined.sort(Comparator.comparing(GroupParticipant::getPledgedAt, Comparator.nullsLast(Comparator.reverseOrder())));
            nonCancelled = combined;
        } else {
            nonCancelled = Collections.emptyList();
        }

        int totalParticipants = nonCancelled.size();
        List<GroupParticipantResponse> recent = nonCancelled.stream()
                .limit(5)
                .map(this::mapToParticipantResponse)
                .collect(Collectors.toList());

        return GroupPurchaseResponse.builder()
                .id(gp.getId())
                .batchCode(gp.getBatchCode())
                .product(ProductSummaryResponse.fromEntity(gp.getProduct()))
                .clusterName(gp.getClusterName())
                .targetQuantity(target)
                .currentQuantity(current)
                .remainingQuantity(remaining)
                .progressPercent(progressPercent)
                .householdLimit(gp.getHouseholdLimit())
                .status(gp.getStatus())
                .deadline(gp.getDeadline())
                .paymentWindowMins(gp.getPaymentWindowMins())
                .paymentDeadline(gp.getPaymentDeadline())
                .leadOrganiser(gp.getLeadOrganiser())
                .hubDropLocation(gp.getHubDropLocation())
                .isFreeDelivery(gp.getIsFreeDelivery())
                .contextMessage(computeContextMessage(gp.getStatus(), remaining))
                .totalParticipants(totalParticipants)
                .recentParticipants(recent)
                .build();
    }

    public GroupParticipantResponse mapToParticipantResponse(GroupParticipant participant) {
        if (participant == null) return null;

        return GroupParticipantResponse.builder()
                .id(participant.getId())
                .commitmentCode(participant.getCommitmentCode())
                .groupPurchaseId(participant.getGroupPurchase() != null ? participant.getGroupPurchase().getId() : null)
                .batchCode(participant.getGroupPurchase() != null ? participant.getGroupPurchase().getBatchCode() : null)
                .displayName(participant.getDisplayName())
                .initials(extractInitials(participant.getDisplayName()))
                .location(participant.getLocation())
                .quantity(participant.getQuantity())
                .unitPrice(participant.getUnitPrice())
                .totalAmount(participant.getTotalAmount())
                .mrpTotal(participant.getMrpTotal())
                .savings(participant.getSavings())
                .status(participant.getStatus())
                .pledgedAt(participant.getPledgedAt())
                .timeAgo(formatTimeAgo(participant.getPledgedAt()))
                .isCurrentUser(false)
                .build();
    }

    public String computeContextMessage(GroupPurchaseStatus status, int remainingQuantity) {
        if (status == GroupPurchaseStatus.CONFIRMED || status == GroupPurchaseStatus.DISPATCHED || status == GroupPurchaseStatus.DELIVERED) {
            return "Locked & dispatched for delivery";
        } else if (status == GroupPurchaseStatus.EXPIRED || status == GroupPurchaseStatus.CANCELLED) {
            return "Target not met • No money was charged to anyone";
        } else if (remainingQuantity <= 5) {
            return "Group goal almost reached! Fast locking";
        } else {
            return "Offer just opened today";
        }
    }

    public String extractInitials(String displayName) {
        if (displayName == null || displayName.trim().isEmpty()) {
            return "NB";
        }
        String cleaned = displayName.trim();
        String[] parts = cleaned.split("\\s+");
        StringBuilder initials = new StringBuilder();
        for (String part : parts) {
            for (int i = 0; i < part.length(); i++) {
                char c = part.charAt(i);
                if (Character.isLetter(c)) {
                    initials.append(Character.toUpperCase(c));
                    break;
                }
            }
            if (initials.length() >= 2) {
                break;
            }
        }
        if (initials.length() == 0) {
            return "NB";
        }
        return initials.toString();
    }

    public String formatTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) {
            return "just now";
        }
        Duration duration = Duration.between(dateTime, LocalDateTime.now());
        long seconds = Math.abs(duration.getSeconds());
        if (seconds < 60) {
            return "just now";
        }
        long minutes = seconds / 60;
        if (minutes < 60) {
            return minutes == 1 ? "1 min ago" : minutes + " mins ago";
        }
        long hours = minutes / 60;
        if (hours < 24) {
            return hours == 1 ? "1 hour ago" : hours + " hours ago";
        }
        long days = hours / 24;
        return days == 1 ? "1 day ago" : days + " days ago";
    }
}
