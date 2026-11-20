package com.gathercart.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gathercart.config.WebConfig;
import com.gathercart.dto.AddToCartRequest;
import com.gathercart.dto.CartItemResponse;
import com.gathercart.dto.CartResponse;
import com.gathercart.dto.UpdateCartItemRequest;
import com.gathercart.entity.User;
import com.gathercart.entity.UserRole;
import com.gathercart.exception.GlobalExceptionHandler;
import com.gathercart.security.CurrentUser;
import com.gathercart.service.CartService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.gathercart.security.JwtService;
import org.springframework.security.core.userdetails.UserDetailsService;

@WebMvcTest(controllers = CartController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({WebConfig.class, GlobalExceptionHandler.class})
@WithMockUser
class CartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CartService cartService;

    @MockBean
    private CurrentUser currentUser;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .fullName("Test User")
                .email("test@gathercart.com")
                .phone("+919999999999")
                .role(UserRole.CUSTOMER)
                .isActive(true)
                .build();
        mockUser.setId(1L);

        when(currentUser.require()).thenReturn(mockUser);
        when(currentUser.get()).thenReturn(mockUser);
    }

    private CartResponse sampleCartResponse() {
        CartItemResponse item = CartItemResponse.builder()
                .id(10L)
                .productId(1L)
                .productName("Sona Masoori Raw Rice")
                .unitLabel("10 kg bag")
                .quantity(2)
                .mrpUnitPrice(new BigDecimal("850.00"))
                .appliedUnitPrice(new BigDecimal("649.00"))
                .mrpSubtotal(new BigDecimal("1700.00"))
                .itemSubtotal(new BigDecimal("1298.00"))
                .itemSavings(new BigDecimal("402.00"))
                .savingsPercent(24)
                .isGroupPriceApplied(true)
                .activeBatchCode("IND-409")
                .maxAllowedQuantity(3)
                .build();

        return CartResponse.builder()
                .id(1L)
                .userId(1L)
                .clusterId(1L)
                .items(List.of(item))
                .totalItems(2)
                .itemCount(1)
                .mrpSubtotal(new BigDecimal("1700.00"))
                .subtotal(new BigDecimal("1298.00"))
                .applicableDiscounts(new BigDecimal("402.00"))
                .estimatedSavings(new BigDecimal("402.00"))
                .deliveryFee(new BigDecimal("0.00"))
                .finalEstimatedTotal(new BigDecimal("1298.00"))
                .deliveryNote("Free pickup at Indiranagar Community Hub")
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/cart returns 200 with cart envelope")
    void getCart_returnsCart() throws Exception {
        when(cartService.getCart(1L)).thenReturn(sampleCartResponse());

        mockMvc.perform(get("/api/v1/cart"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalItems").value(2))
                .andExpect(jsonPath("$.data.finalEstimatedTotal").value(1298.00))
                .andExpect(jsonPath("$.data.items[0].productName").value("Sona Masoori Raw Rice"));
    }

    @Test
    @DisplayName("POST /api/v1/cart/items returns 201 when valid")
    void addToCart_validRequest_returnsCreated() throws Exception {
        AddToCartRequest request = AddToCartRequest.builder()
                .productId(1L)
                .quantity(2)
                .build();

        when(cartService.addToCart(eq(1L), any(AddToCartRequest.class)))
                .thenReturn(sampleCartResponse());

        mockMvc.perform(post("/api/v1/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items").isArray());
    }

    @Test
    @DisplayName("POST /api/v1/cart/items returns 400 when quantity is invalid")
    void addToCart_invalidQuantity_returnsBadRequest() throws Exception {
        AddToCartRequest request = AddToCartRequest.builder()
                .productId(1L)
                .quantity(0)
                .build();

        mockMvc.perform(post("/api/v1/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("PUT /api/v1/cart/items/{id} returns 200 on update")
    void updateQuantity_returnsUpdatedCart() throws Exception {
        UpdateCartItemRequest request = UpdateCartItemRequest.builder()
                .quantity(3)
                .build();

        when(cartService.updateQuantity(eq(1L), eq(10L), any(UpdateCartItemRequest.class)))
                .thenReturn(sampleCartResponse());

        mockMvc.perform(put("/api/v1/cart/items/10")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("DELETE /api/v1/cart/items/{id} returns 200 on remove")
    void removeItem_returnsUpdatedCart() throws Exception {
        when(cartService.removeItem(eq(1L), eq(10L)))
                .thenReturn(sampleCartResponse());

        mockMvc.perform(delete("/api/v1/cart/items/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("DELETE /api/v1/cart returns 200 on clear")
    void clearCart_returnsEmptyCart() throws Exception {
        CartResponse emptyCart = CartResponse.builder()
                .id(1L)
                .items(List.of())
                .totalItems(0)
                .itemCount(0)
                .finalEstimatedTotal(BigDecimal.ZERO)
                .build();

        when(cartService.clearCart(1L))
                .thenReturn(emptyCart);

        mockMvc.perform(delete("/api/v1/cart"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalItems").value(0));
    }
}
