package com.gathercart.service;

import com.gathercart.dto.CreateGroupPurchaseRequest;
import com.gathercart.dto.GroupParticipantResponse;
import com.gathercart.dto.GroupPurchaseResponse;
import com.gathercart.dto.JoinGroupRequest;
import com.gathercart.dto.PageResponse;
import com.gathercart.entity.Category;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GroupPurchaseServiceTest {

    @Mock
    private GroupPurchaseRepository groupPurchaseRepository;

    @Mock
    private GroupParticipantRepository groupParticipantRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private GroupPurchaseService groupPurchaseService;

    private Product testProduct;
    private GroupPurchase testGroupPurchase;

    @BeforeEach
    void setUp() {
        Category category = Category.builder()
                .name("Rice & Grains")
                .icon("🌾")
                .displayOrder(1)
                .isActive(true)
                .build();
        category.setId(1L);

        testProduct = Product.builder()
                .name("Sona Masoori Raw Rice")
                .description("Aged 12 Months")
                .category(category)
                .unitLabel("10 kg bag")
                .mrp(new BigDecimal("850.00"))
                .groupPrice(new BigDecimal("649.00"))
                .isActive(true)
                .build();
        testProduct.setId(1L);

        testGroupPurchase = GroupPurchase.builder()
                .batchCode("GP-TEST-001")
                .product(testProduct)
                .clusterName("Indiranagar Collective")
                .targetQuantity(25)
                .currentQuantity(10)
                .householdLimit(3)
                .status(GroupPurchaseStatus.OPEN)
                .deadline(LocalDateTime.now().plusDays(2))
                .paymentWindowMins(10)
                .leadOrganiser("Priya Sharma")
                .hubDropLocation("Indiranagar Club Gate 2")
                .isFreeDelivery(true)
                .participants(new ArrayList<>())
                .build();
        testGroupPurchase.setId(100L);
    }

    @Test
    @DisplayName("Should create group purchase successfully with generated batchCode and open status")
    void shouldCreateGroupPurchaseSuccessfully() {
        CreateGroupPurchaseRequest request = CreateGroupPurchaseRequest.builder()
                .productId(1L)
                .targetQuantity(25)
                .householdLimit(3)
                .deadline(LocalDateTime.now().plusDays(3))
                .clusterName("Indiranagar Collective")
                .leadOrganiser("Priya Sharma")
                .hubDropLocation("Indiranagar Club Gate 2")
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(groupPurchaseRepository.save(any(GroupPurchase.class))).thenAnswer(invocation -> {
            GroupPurchase gp = invocation.getArgument(0);
            gp.setId(101L);
            return gp;
        });

        GroupPurchaseResponse response = groupPurchaseService.createGroupPurchase(request);

        assertNotNull(response);
        assertEquals(101L, response.getId());
        assertEquals(25, response.getTargetQuantity());
        assertEquals(0, response.getCurrentQuantity());
        assertEquals(25, response.getRemainingQuantity());
        assertEquals(GroupPurchaseStatus.OPEN, response.getStatus());
        assertNotNull(response.getBatchCode());
        assertEquals("Indiranagar Collective", response.getClusterName());
        verify(groupPurchaseRepository).save(any(GroupPurchase.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when creating group for non-existent product")
    void shouldFailCreateGroupWhenProductNotFound() {
        CreateGroupPurchaseRequest request = CreateGroupPurchaseRequest.builder()
                .productId(999L)
                .targetQuantity(25)
                .deadline(LocalDateTime.now().plusDays(1))
                .build();

        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> groupPurchaseService.createGroupPurchase(request));
        verify(groupPurchaseRepository, never()).save(any(GroupPurchase.class));
    }

    @Test
    @DisplayName("Should join group successfully and compute authoritative unit price, totals, and savings")
    void shouldJoinGroupSuccessfullyAndComputeAuthoritativeValues() {
        JoinGroupRequest request = JoinGroupRequest.builder()
                .quantity(2)
                .phone("9876543210")
                .displayName("Priya M.")
                .location("Indiranagar 2nd Stage")
                .userId(5L)
                .build();

        when(groupPurchaseRepository.findByIdWithLock(100L)).thenReturn(Optional.of(testGroupPurchase));
        when(groupParticipantRepository.sumQuantityByGroupPurchaseIdAndPhone(100L, "9876543210")).thenReturn(0);
        when(groupParticipantRepository.findByGroupPurchaseIdAndPhoneAndStatus(100L, "9876543210", GroupParticipantStatus.ACTIVE))
                .thenReturn(Optional.empty());
        when(groupParticipantRepository.findByGroupPurchaseIdAndUserIdAndStatus(100L, 5L, GroupParticipantStatus.ACTIVE))
                .thenReturn(Optional.empty());
        when(groupParticipantRepository.save(any(GroupParticipant.class))).thenAnswer(invocation -> {
            GroupParticipant gp = invocation.getArgument(0);
            gp.setId(201L);
            return gp;
        });
        when(groupPurchaseRepository.save(any(GroupPurchase.class))).thenReturn(testGroupPurchase);

        GroupParticipantResponse response = groupPurchaseService.joinGroup(100L, request);

        assertNotNull(response);
        assertEquals(201L, response.getId());
        assertEquals(2, response.getQuantity());
        assertEquals(new BigDecimal("649.00"), response.getUnitPrice());
        assertEquals(new BigDecimal("1298.00"), response.getTotalAmount());
        assertEquals(new BigDecimal("1700.00"), response.getMrpTotal());
        assertEquals(new BigDecimal("402.00"), response.getSavings());
        assertEquals(GroupParticipantStatus.ACTIVE, response.getStatus());
        assertEquals("PM", response.getInitials());
        assertTrue(response.getCommitmentCode().startsWith("NB-CMT-"));
        assertEquals(12, testGroupPurchase.getCurrentQuantity());
    }

    @Test
    @DisplayName("Should reject join request when requested quantity exceeds remaining capacity")
    void shouldFailJoinWhenExceedingCapacity() {
        testGroupPurchase.setCurrentQuantity(24); // target is 25, only 1 left
        JoinGroupRequest request = JoinGroupRequest.builder()
                .quantity(2)
                .phone("9876543210")
                .displayName("Karthik R.")
                .userId(5L)
                .build();

        when(groupPurchaseRepository.findByIdWithLock(100L)).thenReturn(Optional.of(testGroupPurchase));
        when(groupParticipantRepository.sumQuantityByGroupPurchaseIdAndPhone(100L, "9876543210")).thenReturn(0);
        when(groupParticipantRepository.findByGroupPurchaseIdAndPhoneAndStatus(100L, "9876543210", GroupParticipantStatus.ACTIVE))
                .thenReturn(Optional.empty());

        BusinessException ex = assertThrows(BusinessException.class, () -> groupPurchaseService.joinGroup(100L, request));
        assertTrue(ex.getMessage().contains("capacity"));
        verify(groupParticipantRepository, never()).save(any(GroupParticipant.class));
    }

    @Test
    @DisplayName("Should reject join request when requested quantity exceeds household limit")
    void shouldFailJoinWhenExceedingHouseholdLimit() {
        JoinGroupRequest request = JoinGroupRequest.builder()
                .quantity(2)
                .phone("9876543210")
                .displayName("Karthik R.")
                .userId(5L)
                .build();

        when(groupPurchaseRepository.findByIdWithLock(100L)).thenReturn(Optional.of(testGroupPurchase));
        // Phone already has 2 units pledged, householdLimit is 3 -> 2 + 2 = 4 > 3
        when(groupParticipantRepository.sumQuantityByGroupPurchaseIdAndPhone(100L, "9876543210")).thenReturn(2);
        when(groupParticipantRepository.findByGroupPurchaseIdAndPhoneAndStatus(100L, "9876543210", GroupParticipantStatus.ACTIVE))
                .thenReturn(Optional.empty());

        BusinessException ex = assertThrows(BusinessException.class, () -> groupPurchaseService.joinGroup(100L, request));
        assertTrue(ex.getMessage().contains("household limit"));
        verify(groupParticipantRepository, never()).save(any(GroupParticipant.class));
    }

    @Test
    @DisplayName("Should reject join request when user already has an active pledge in the group")
    void shouldFailJoinWhenDuplicateActivePledge() {
        JoinGroupRequest request = JoinGroupRequest.builder()
                .quantity(1)
                .phone("9876543210")
                .displayName("Priya M.")
                .userId(5L)
                .build();

        GroupParticipant existingPledge = GroupParticipant.builder()
                .groupPurchase(testGroupPurchase)
                .userId(5L)
                .phone("9876543210")
                .status(GroupParticipantStatus.ACTIVE)
                .quantity(1)
                .build();

        when(groupPurchaseRepository.findByIdWithLock(100L)).thenReturn(Optional.of(testGroupPurchase));
        when(groupParticipantRepository.findByGroupPurchaseIdAndPhoneAndStatus(100L, "9876543210", GroupParticipantStatus.ACTIVE))
                .thenReturn(Optional.of(existingPledge));

        BusinessException ex = assertThrows(BusinessException.class, () -> groupPurchaseService.joinGroup(100L, request));
        assertTrue(ex.getMessage().contains("active pledge"));
        verify(groupParticipantRepository, never()).save(any(GroupParticipant.class));
    }

    @Test
    @DisplayName("Should reject join request when group is not OPEN or deadline has passed")
    void shouldFailJoinWhenGroupNotOpenOrExpired() {
        testGroupPurchase.setStatus(GroupPurchaseStatus.CONFIRMED);
        JoinGroupRequest request = JoinGroupRequest.builder()
                .quantity(1)
                .phone("9876543210")
                .userId(5L)
                .build();

        when(groupPurchaseRepository.findByIdWithLock(100L)).thenReturn(Optional.of(testGroupPurchase));

        BusinessException ex = assertThrows(BusinessException.class, () -> groupPurchaseService.joinGroup(100L, request));
        assertTrue(ex.getMessage().contains("not open"));

        testGroupPurchase.setStatus(GroupPurchaseStatus.OPEN);
        testGroupPurchase.setDeadline(LocalDateTime.now().minusHours(1));

        BusinessException ex2 = assertThrows(BusinessException.class, () -> groupPurchaseService.joinGroup(100L, request));
        assertTrue(ex2.getMessage().contains("deadline"));
    }

    @Test
    @DisplayName("Should automatically transition group to CONFIRMED and participants to PAYMENT_PENDING when target is reached")
    void shouldAutoConfirmGroupWhenTargetReached() {
        testGroupPurchase.setCurrentQuantity(23); // target is 25, joining 2 units reaches 25
        JoinGroupRequest request = JoinGroupRequest.builder()
                .quantity(2)
                .phone("9876543210")
                .displayName("Ananya Sharma")
                .userId(5L)
                .build();

        GroupParticipant existingParticipant = GroupParticipant.builder()
                .groupPurchase(testGroupPurchase)
                .displayName("Karthik R.")
                .phone("9111111111")
                .quantity(23)
                .status(GroupParticipantStatus.ACTIVE)
                .unitPrice(new BigDecimal("649.00"))
                .totalAmount(new BigDecimal("14927.00"))
                .mrpTotal(new BigDecimal("19550.00"))
                .savings(new BigDecimal("4623.00"))
                .pledgedAt(LocalDateTime.now().minusHours(2))
                .build();
        existingParticipant.setId(301L);

        when(groupPurchaseRepository.findByIdWithLock(100L)).thenReturn(Optional.of(testGroupPurchase));
        when(groupParticipantRepository.sumQuantityByGroupPurchaseIdAndPhone(100L, "9876543210")).thenReturn(0);
        when(groupParticipantRepository.findByGroupPurchaseIdAndPhoneAndStatus(100L, "9876543210", GroupParticipantStatus.ACTIVE))
                .thenReturn(Optional.empty());
        when(groupParticipantRepository.findByGroupPurchaseIdAndStatusOrderByPledgedAtDesc(100L, GroupParticipantStatus.ACTIVE))
                .thenReturn(List.of(existingParticipant));
        when(groupParticipantRepository.save(any(GroupParticipant.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(groupPurchaseRepository.save(any(GroupPurchase.class))).thenReturn(testGroupPurchase);

        GroupParticipantResponse response = groupPurchaseService.joinGroup(100L, request);

        assertEquals(25, testGroupPurchase.getCurrentQuantity());
        assertEquals(GroupPurchaseStatus.CONFIRMED, testGroupPurchase.getStatus());
        assertNotNull(testGroupPurchase.getPaymentDeadline());
        assertEquals(GroupParticipantStatus.PAYMENT_PENDING, response.getStatus());
        assertEquals(GroupParticipantStatus.PAYMENT_PENDING, existingParticipant.getStatus());
        assertNotNull(existingParticipant.getPaymentDueAt());
    }

    @Test
    @DisplayName("Should update pledge quantity and recalculate totals")
    void shouldUpdateQuantitySuccessfully() {
        GroupParticipant participant = GroupParticipant.builder()
                .groupPurchase(testGroupPurchase)
                .displayName("Priya M.")
                .phone("9876543210")
                .quantity(1)
                .unitPrice(new BigDecimal("649.00"))
                .totalAmount(new BigDecimal("649.00"))
                .mrpTotal(new BigDecimal("850.00"))
                .savings(new BigDecimal("201.00"))
                .status(GroupParticipantStatus.ACTIVE)
                .pledgedAt(LocalDateTime.now().minusMinutes(30))
                .build();
        participant.setId(401L);

        when(groupParticipantRepository.findById(401L)).thenReturn(Optional.of(participant));
        when(groupPurchaseRepository.findByIdWithLock(100L)).thenReturn(Optional.of(testGroupPurchase));
        // Phone currently has 1 unit, delta is +1, new total is 2 <= household limit 3
        when(groupParticipantRepository.sumQuantityByGroupPurchaseIdAndPhone(100L, "9876543210")).thenReturn(1);
        when(groupParticipantRepository.save(any(GroupParticipant.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(groupPurchaseRepository.save(any(GroupPurchase.class))).thenReturn(testGroupPurchase);

        GroupParticipantResponse response = groupPurchaseService.updateQuantity(401L, 2);

        assertEquals(2, response.getQuantity());
        assertEquals(new BigDecimal("1298.00"), response.getTotalAmount());
        assertEquals(new BigDecimal("1700.00"), response.getMrpTotal());
        assertEquals(new BigDecimal("402.00"), response.getSavings());
        assertEquals(11, testGroupPurchase.getCurrentQuantity()); // was 10, now 11
    }

    @Test
    @DisplayName("Should cancel participation, reduce group quantity, and revert confirmed group to OPEN")
    void shouldCancelParticipationAndReopenConfirmedGroup() {
        testGroupPurchase.setCurrentQuantity(25);
        testGroupPurchase.setStatus(GroupPurchaseStatus.CONFIRMED);
        testGroupPurchase.setPaymentDeadline(LocalDateTime.now().plusMinutes(10));

        GroupParticipant participant = GroupParticipant.builder()
                .groupPurchase(testGroupPurchase)
                .displayName("Priya M.")
                .phone("9876543210")
                .quantity(2)
                .unitPrice(new BigDecimal("649.00"))
                .totalAmount(new BigDecimal("1298.00"))
                .mrpTotal(new BigDecimal("1700.00"))
                .savings(new BigDecimal("402.00"))
                .status(GroupParticipantStatus.PAYMENT_PENDING)
                .pledgedAt(LocalDateTime.now().minusHours(1))
                .build();
        participant.setId(501L);

        GroupParticipant otherParticipant = GroupParticipant.builder()
                .groupPurchase(testGroupPurchase)
                .displayName("Karthik R.")
                .phone("9111111111")
                .quantity(23)
                .status(GroupParticipantStatus.PAYMENT_PENDING)
                .pledgedAt(LocalDateTime.now().minusHours(2))
                .build();
        otherParticipant.setId(502L);

        when(groupParticipantRepository.findById(501L)).thenReturn(Optional.of(participant));
        when(groupPurchaseRepository.findByIdWithLock(100L)).thenReturn(Optional.of(testGroupPurchase));
        when(groupParticipantRepository.findByGroupPurchaseIdAndStatusOrderByPledgedAtDesc(100L, GroupParticipantStatus.PAYMENT_PENDING))
                .thenReturn(List.of(otherParticipant));
        when(groupParticipantRepository.save(any(GroupParticipant.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(groupPurchaseRepository.save(any(GroupPurchase.class))).thenReturn(testGroupPurchase);

        groupPurchaseService.cancelParticipation(501L);

        assertEquals(GroupParticipantStatus.CANCELLED, participant.getStatus());
        assertNotNull(participant.getCancelledAt());
        assertEquals(23, testGroupPurchase.getCurrentQuantity());
        assertEquals(GroupPurchaseStatus.OPEN, testGroupPurchase.getStatus());
        assertNull(testGroupPurchase.getPaymentDeadline());
        assertEquals(GroupParticipantStatus.ACTIVE, otherParticipant.getStatus());
        assertNull(otherParticipant.getPaymentDueAt());
    }

    @Test
    @DisplayName("Should retrieve active group purchase by productId")
    void shouldGetActiveGroupByProductId() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(groupPurchaseRepository.findActiveByProductId(1L)).thenReturn(List.of(testGroupPurchase));

        GroupPurchaseResponse response = groupPurchaseService.getActiveGroupByProductId(1L);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals(15, response.getRemainingQuantity());
        assertEquals(40, response.getProgressPercent()); // 10/25 * 100 = 40%
        assertEquals("Indiranagar Collective", response.getClusterName());
    }

    @Test
    @DisplayName("Should compute correct context messages based on status and remaining quantity")
    void shouldComputeCorrectContextMessages() {
        when(groupPurchaseRepository.findById(100L)).thenReturn(Optional.of(testGroupPurchase));

        // 1. CONFIRMED
        testGroupPurchase.setStatus(GroupPurchaseStatus.CONFIRMED);
        assertEquals("Locked & dispatched for delivery", groupPurchaseService.getGroupPurchaseById(100L).getContextMessage());

        // 2. EXPIRED
        testGroupPurchase.setStatus(GroupPurchaseStatus.EXPIRED);
        assertEquals("Target not met • No money was charged to anyone", groupPurchaseService.getGroupPurchaseById(100L).getContextMessage());

        // 3. OPEN, remaining <= 5
        testGroupPurchase.setStatus(GroupPurchaseStatus.OPEN);
        testGroupPurchase.setCurrentQuantity(21); // target 25 -> remaining 4
        assertEquals("Group goal almost reached! Fast locking", groupPurchaseService.getGroupPurchaseById(100L).getContextMessage());

        // 4. OPEN, remaining > 5
        testGroupPurchase.setCurrentQuantity(10); // target 25 -> remaining 15
        assertEquals("Offer just opened today", groupPurchaseService.getGroupPurchaseById(100L).getContextMessage());
    }

    @Test
    @DisplayName("Should retrieve paginated group purchases with status filter")
    void shouldGetGroupPurchasesPaginated() {
        Pageable pageable = PageRequest.of(0, 10);
        when(groupPurchaseRepository.findByStatus(GroupPurchaseStatus.OPEN, pageable))
                .thenReturn(new PageImpl<>(List.of(testGroupPurchase)));

        PageResponse<GroupPurchaseResponse> response = groupPurchaseService.getGroupPurchases(
                GroupPurchaseStatus.OPEN, null, null, pageable);

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        assertEquals("GP-TEST-001", response.getContent().get(0).getBatchCode());
    }

    @Test
    @DisplayName("Should retrieve participants for a group purchase")
    void shouldGetParticipants() {
        GroupParticipant p1 = GroupParticipant.builder()
                .groupPurchase(testGroupPurchase)
                .displayName("Priya M.")
                .phone("9876543210")
                .quantity(2)
                .unitPrice(new BigDecimal("649.00"))
                .totalAmount(new BigDecimal("1298.00"))
                .mrpTotal(new BigDecimal("1700.00"))
                .savings(new BigDecimal("402.00"))
                .status(GroupParticipantStatus.ACTIVE)
                .pledgedAt(LocalDateTime.now().minusHours(1))
                .build();
        p1.setId(601L);
        testGroupPurchase.getParticipants().add(p1);

        when(groupPurchaseRepository.findById(100L)).thenReturn(Optional.of(testGroupPurchase));

        List<GroupParticipantResponse> participants = groupPurchaseService.getParticipants(100L);

        assertEquals(1, participants.size());
        assertEquals("Priya M.", participants.get(0).getDisplayName());
        assertEquals("PM", participants.get(0).getInitials());
    }
}
