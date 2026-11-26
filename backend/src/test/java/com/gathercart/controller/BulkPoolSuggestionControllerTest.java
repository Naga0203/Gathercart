package com.gathercart.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gathercart.dto.BulkPoolSuggestionRequest;
import com.gathercart.dto.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class BulkPoolSuggestionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createSuggestion_anonymousValid_shouldReturn201() throws Exception {
        BulkPoolSuggestionRequest request = BulkPoolSuggestionRequest.builder()
                .productName("Organic Khapli Wheat Flour (10 kg)")
                .category("Rice & Grains")
                .notes("Needed for 12 families in My Home Bhooja")
                .contactPhone("+919876500001")
                .build();

        mockMvc.perform(post("/api/v1/pool-suggestions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.productName").value("Organic Khapli Wheat Flour (10 kg)"))
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.clusterName").value("Madhapur, Hyderabad"));
    }

    @Test
    void createSuggestion_blankProductName_shouldReturn400() throws Exception {
        BulkPoolSuggestionRequest request = BulkPoolSuggestionRequest.builder()
                .productName(" ")
                .build();

        mockMvc.perform(post("/api/v1/pool-suggestions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getMySuggestions_shouldRequireAuthAndScopeToUser() throws Exception {
        mockMvc.perform(get("/api/v1/pool-suggestions/mine"))
                .andExpect(status().isUnauthorized());

        RegisterRequest reg = RegisterRequest.builder()
                .fullName("Suggest User")
                .phone("+919000000201")
                .email("suggestuser@example.com")
                .password("password123")
                .agreedToTerms(true)
                .build();
        MvcResult regRes = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andReturn();
        String token = objectMapper.readTree(regRes.getResponse().getContentAsString())
                .at("/data/token").asText();

        BulkPoolSuggestionRequest request = BulkPoolSuggestionRequest.builder()
                .productName("Kashmiri Saffron 5g Pack")
                .category("Dry Fruits")
                .build();
        mockMvc.perform(post("/api/v1/pool-suggestions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/pool-suggestions/mine")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].productName").value("Kashmiri Saffron 5g Pack"));
    }
}
