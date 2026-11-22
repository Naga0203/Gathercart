package com.gathercart.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gathercart.config.WebConfig;
import com.gathercart.dto.GroupParticipantResponse;
import com.gathercart.dto.GroupPurchaseResponse;
import com.gathercart.dto.JoinGroupRequest;
import com.gathercart.dto.PageResponse;
import com.gathercart.dto.UpdatePledgeQuantityRequest;
import com.gathercart.entity.GroupParticipantStatus;
import com.gathercart.entity.GroupPurchaseStatus;
import com.gathercart.entity.User;
import com.gathercart.entity.UserRole;
import com.gathercart.exception.GlobalExceptionHandler;
import com.gathercart.security.CurrentUser;
import com.gathercart.security.JwtService;
import com.gathercart.service.GroupPurchaseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = GroupPurchaseController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({WebConfig.class, GlobalExceptionHandler.class})
@WithMockUser
class GroupPurchaseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private GroupPurchaseService groupPurchaseService;

    @MockBean
    private CurrentUser currentUser;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    private User testUser;
    private GroupPurchaseResponse testBatchResponse;
    private GroupParticipantResponse testParticipantResponse;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .fullName("Ananya Sharma")
                .email("ananya.sharma@example.com")
                .phone("+919876543210")
                .role(UserRole.CUSTOMER)
                .clusterId(1L)
                .build();
        testUser.setId(10L);

        when(currentUser.require()).thenReturn(testUser);
        when(currentUser.get()).thenReturn(testUser);

        testBatchResponse = GroupPurchaseResponse.builder()
                .id(1L)
                .batchCode("IND-409")
                .targetQuantity(25)
                .currentQuantity(20)
                .remainingQuantity(5)
                .progressPercent(80)
                .householdLimit(3)
                .status(GroupPurchaseStatus.OPEN)
                .deadline(LocalDateTime.now().plusDays(2))
                .isFreeDelivery(true)
                .build();

        testParticipantResponse = GroupParticipantResponse.builder()
                .id(100L)
                .commitmentCode("NB-CMT-102-RICE")
                .groupPurchaseId(1L)
                .batchCode("IND-409")
                .displayName("Ananya Sharma")
                .quantity(2)
                .unitPrice(new BigDecimal("649.00"))
                .totalAmount(new BigDecimal("1298.00"))
                .status(GroupParticipantStatus.ACTIVE)
                .pledgedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/batches - should return paged batches")
    void getBatches_shouldReturnPagedBatches() throws Exception {
        PageResponse<GroupPurchaseResponse> paged = PageResponse.from(
                new PageImpl<>(List.of(testBatchResponse), PageRequest.of(0, 10), 1),
                List.of(testBatchResponse)
        );

        when(groupPurchaseService.getGroupPurchases(any(), any(), any(), any())).thenReturn(paged);

        mockMvc.perform(get("/api/v1/batches")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].batchCode").value("IND-409"))
                .andExpect(jsonPath("$.data.content[0].currentQuantity").value(20));
    }

    @Test
    @DisplayName("GET /api/v1/batches/{id} - should return single batch")
    void getBatchById_shouldReturnBatch() throws Exception {
        when(groupPurchaseService.getGroupPurchaseById(1L)).thenReturn(testBatchResponse);

        mockMvc.perform(get("/api/v1/batches/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.batchCode").value("IND-409"));
    }

    @Test
    @DisplayName("GET /api/v1/batches/by-product/{productId} - should return active batch")
    void getActiveBatchByProductId_shouldReturnBatch() throws Exception {
        when(groupPurchaseService.getActiveGroupByProductId(5L)).thenReturn(testBatchResponse);

        mockMvc.perform(get("/api/v1/batches/by-product/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.batchCode").value("IND-409"));
    }

    @Test
    @DisplayName("GET /api/v1/batches/{id}/participants - should return participants list")
    void getParticipants_shouldReturnList() throws Exception {
        when(groupPurchaseService.getParticipants(1L)).thenReturn(List.of(testParticipantResponse));

        mockMvc.perform(get("/api/v1/batches/1/participants"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].commitmentCode").value("NB-CMT-102-RICE"));
    }

    @Test
    @DisplayName("GET /api/v1/batches/my-pledges - should return user's pledges")
    void getMyPledges_shouldReturnUserPledges() throws Exception {
        when(groupPurchaseService.getUserParticipations(10L)).thenReturn(List.of(testParticipantResponse));

        mockMvc.perform(get("/api/v1/batches/my-pledges"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].displayName").value("Ananya Sharma"));
    }

    @Test
    @DisplayName("POST /api/v1/batches/{id}/pledge - should create pledge and return 201")
    void joinBatch_shouldCreatePledge() throws Exception {
        JoinGroupRequest request = JoinGroupRequest.builder()
                .quantity(2)
                .phone("+919876543210")
                .displayName("Ananya S.")
                .location("Flat 402")
                .build();

        when(groupPurchaseService.joinGroup(eq(1L), any(JoinGroupRequest.class))).thenReturn(testParticipantResponse);

        mockMvc.perform(post("/api/v1/batches/1/pledge")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.commitmentCode").value("NB-CMT-102-RICE"));
    }

    @Test
    @DisplayName("PATCH /api/v1/batches/pledges/{id} - should update pledge quantity")
    void updatePledgeQuantity_shouldUpdateAndReturn200() throws Exception {
        UpdatePledgeQuantityRequest request = UpdatePledgeQuantityRequest.builder()
                .quantity(3)
                .build();

        when(groupPurchaseService.updateQuantity(eq(100L), eq(3), eq(10L))).thenReturn(testParticipantResponse);

        mockMvc.perform(patch("/api/v1/batches/pledges/100")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("DELETE /api/v1/batches/pledges/{id} - should cancel pledge")
    void cancelPledge_shouldReturn200() throws Exception {
        mockMvc.perform(delete("/api/v1/batches/pledges/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
