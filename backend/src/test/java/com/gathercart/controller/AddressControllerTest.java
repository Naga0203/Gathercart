package com.gathercart.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gathercart.dto.AddressRequest;
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
class AddressControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String registerAndGetToken(String email, String phone) throws Exception {
        RegisterRequest regReq = RegisterRequest.builder()
                .fullName("Address Tester")
                .phone(phone)
                .email(email)
                .password("password123")
                .agreedToTerms(true)
                .build();
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString())
                .at("/data/token").asText();
    }

    @Test
    void addresses_withoutAuth_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/addresses"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void crudAndDefaultSwitching_shouldWorkAndEnforceMaxFive() throws Exception {
        String token = registerAndGetToken("addr1@example.com", "+919000000101");

        // Create first address (auto-defaults when isDefault omitted)
        AddressRequest req1 = AddressRequest.builder()
                .label("Home")
                .addressLine1("Flat 101, Lotus")
                .pincode("500081")
                .build();
        MvcResult res1 = mockMvc.perform(post("/api/v1/addresses")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.isDefault").value(true))
                .andReturn();
        Long addr1Id = objectMapper.readTree(res1.getResponse().getContentAsString())
                .at("/data/id").asLong();

        // Create second address as default -> clears first default
        AddressRequest req2 = AddressRequest.builder()
                .label("Office")
                .addressLine1("Cyber Towers, Madhapur")
                .pincode("500081")
                .isDefault(true)
                .build();
        mockMvc.perform(post("/api/v1/addresses")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req2)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.isDefault").value(true));

        // Verify list order (default first)
        mockMvc.perform(get("/api/v1/addresses")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].label").value("Office"))
                .andExpect(jsonPath("$.data[1].isDefault").value(false));

        // Update first address
        req1.setAddressLine1("Flat 102, Lotus");
        req1.setIsDefault(true);
        mockMvc.perform(put("/api/v1/addresses/" + addr1Id)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.addressLine1").value("Flat 102, Lotus"))
                .andExpect(jsonPath("$.data.isDefault").value(true));

        // Create 3 more to hit max 5
        for (int i = 3; i <= 5; i++) {
            AddressRequest extra = AddressRequest.builder()
                    .label("Extra " + i)
                    .addressLine1("Street " + i)
                    .pincode("500081")
                    .build();
            mockMvc.perform(post("/api/v1/addresses")
                            .header("Authorization", "Bearer " + token)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(extra)))
                    .andExpect(status().isCreated());
        }

        // 6th address should fail with 422
        AddressRequest sixth = AddressRequest.builder()
                .addressLine1("Street 6")
                .pincode("500081")
                .build();
        mockMvc.perform(post("/api/v1/addresses")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sixth)))
                .andExpect(status().isUnprocessableEntity());

        // Delete first address
        mockMvc.perform(delete("/api/v1/addresses/" + addr1Id)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/addresses")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(4));
    }

    @Test
    void crossUserAddressAccess_shouldReturn404() throws Exception {
        String tokenA = registerAndGetToken("usera@example.com", "+919000000102");
        String tokenB = registerAndGetToken("userb@example.com", "+919000000103");

        AddressRequest req = AddressRequest.builder()
                .addressLine1("User A Private Address")
                .pincode("500081")
                .build();
        MvcResult res = mockMvc.perform(post("/api/v1/addresses")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();
        Long addrId = objectMapper.readTree(res.getResponse().getContentAsString())
                .at("/data/id").asLong();

        // User B cannot update or delete User A's address
        mockMvc.perform(put("/api/v1/addresses/" + addrId)
                        .header("Authorization", "Bearer " + tokenB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/v1/addresses/" + addrId)
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());
    }
}
