package com.gathercart.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gathercart.dto.LoginRequest;
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
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void register_withValidData_shouldReturn201() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .fullName("Test User")
                .phone("+919000000001")
                .email("testuser@example.com")
                .password("password123")
                .clusterId(1L)
                .agreedToTerms(true)
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("testuser@example.com"))
                .andExpect(jsonPath("$.data.token").isNotEmpty());
    }

    @Test
    void register_withDuplicateEmail_shouldReturn409() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .fullName("Test User")
                .phone("+919000000002")
                .email("duplicate@example.com")
                .password("password123")
                .agreedToTerms(true)
                .build();

        // First registration
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Second registration with same email
        request.setPhone("+919000000003");
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    void login_withValidCredentials_shouldReturn200() throws Exception {
        // Register first
        RegisterRequest regReq = RegisterRequest.builder()
                .fullName("Login User")
                .phone("+919000000004")
                .email("loginuser@example.com")
                .password("password123")
                .agreedToTerms(true)
                .build();
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regReq)));

        // Login
        LoginRequest loginReq = LoginRequest.builder()
                .email("loginuser@example.com")
                .password("password123")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.fullName").value("Login User"));
    }

    @Test
    void login_withInvalidPassword_shouldReturn401() throws Exception {
        // Register first
        RegisterRequest regReq = RegisterRequest.builder()
                .fullName("Bad Login")
                .phone("+919000000005")
                .email("badlogin@example.com")
                .password("password123")
                .agreedToTerms(true)
                .build();
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regReq)));

        LoginRequest loginReq = LoginRequest.builder()
                .email("badlogin@example.com")
                .password("wrongpassword")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void me_withoutToken_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void me_withValidToken_shouldReturnProfile() throws Exception {
        // Register
        RegisterRequest regReq = RegisterRequest.builder()
                .fullName("Me User")
                .phone("+919000000006")
                .email("meuser@example.com")
                .password("password123")
                .agreedToTerms(true)
                .build();
        MvcResult regResult = mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regReq)))
                .andReturn();

        String token = objectMapper.readTree(regResult.getResponse().getContentAsString())
                .at("/data/token").asText();

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("meuser@example.com"))
                .andExpect(jsonPath("$.data.fullName").value("Me User"));
    }

    @Test
    void adminEndpoint_withCustomerRole_shouldReturn403() throws Exception {
        // Register as customer
        RegisterRequest regReq = RegisterRequest.builder()
                .fullName("Customer User")
                .phone("+919000000007")
                .email("customer@example.com")
                .password("password123")
                .agreedToTerms(true)
                .build();
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regReq)))
                .andReturn();

        String token = objectMapper.readTree(result.getResponse().getContentAsString())
                .at("/data/token").asText();

        // Try accessing admin endpoint
        mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"test\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void cart_withoutAuth_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/cart"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void publicEndpoints_shouldBeAccessibleWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/categories"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/products"))
                .andExpect(status().isOk());
    }
}

