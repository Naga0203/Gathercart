package com.gathercart.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gathercart.config.WebConfig;
import com.gathercart.dto.CancelOrderRequest;
import com.gathercart.dto.OrderItemResponse;
import com.gathercart.dto.OrderResponse;
import com.gathercart.entity.FulfillmentType;
import com.gathercart.entity.OrderStatus;
import com.gathercart.entity.User;
import com.gathercart.entity.UserRole;
import com.gathercart.exception.GlobalExceptionHandler;
import com.gathercart.security.AuthEntryPoint;
import com.gathercart.security.CurrentUser;
import com.gathercart.security.JwtAuthenticationFilter;
import com.gathercart.security.JwtService;
import com.gathercart.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = OrderController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({WebConfig.class, GlobalExceptionHandler.class})
@WithMockUser
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OrderService orderService;

    @MockBean
    private CurrentUser currentUser;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private AuthEntryPoint authEntryPoint;

    private User testUser;
    private OrderResponse testOrderResponse;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .fullName("Ananya Sharma")
                .email("ananya@example.com")
                .phone("+919876543210")
                .role(UserRole.CUSTOMER)
                .build();
        testUser.setId(1L);

        OrderItemResponse itemResponse = OrderItemResponse.builder()
                .id(101L)
                .productId(1L)
                .productName("Sona Masoori Rice")
                .quantity(5)
                .mrpUnitPrice(new BigDecimal("1000.00"))
                .appliedUnitPrice(new BigDecimal("960.00"))
                .itemSubtotal(new BigDecimal("4800.00"))
                .savingsAmount(new BigDecimal("200.00"))
                .savingsPercent(4)
                .build();

        testOrderResponse = OrderResponse.builder()
                .id(501L)
                .orderNumber("GC-ORD-20261123-1234")
                .userId(1L)
                .clusterId(1L)
                .fulfillmentType(FulfillmentType.STORE_PICKUP)
                .status(OrderStatus.PLACED)
                .mrpSubtotal(new BigDecimal("5000.00"))
                .discountAmount(new BigDecimal("200.00"))
                .subtotal(new BigDecimal("4800.00"))
                .deliveryFee(new BigDecimal("0.00"))
                .finalTotal(new BigDecimal("4800.00"))
                .paymentMethod("UPI")
                .paymentStatus("PENDING")
                .items(List.of(itemResponse))
                .createdAt(LocalDateTime.now())
                .build();

        when(currentUser.require()).thenReturn(testUser);
    }

    @Test
    @DisplayName("POST /api/v1/orders/checkout - places order successfully")
    void checkout_success() throws Exception {
        when(orderService.checkout(1L)).thenReturn(testOrderResponse);

        mockMvc.perform(post("/api/v1/orders/checkout")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.orderNumber").value("GC-ORD-20261123-1234"))
                .andExpect(jsonPath("$.data.finalTotal").value(4800.00))
                .andExpect(jsonPath("$.data.fulfillmentType").value("STORE_PICKUP"))
                .andExpect(jsonPath("$.data.items[0].productName").value("Sona Masoori Rice"));
    }

    @Test
    @DisplayName("GET /api/v1/orders - returns user orders")
    void getUserOrders_success() throws Exception {
        when(orderService.getUserOrders(1L)).thenReturn(List.of(testOrderResponse));

        mockMvc.perform(get("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(501))
                .andExpect(jsonPath("$.data[0].orderNumber").value("GC-ORD-20261123-1234"));
    }

    @Test
    @DisplayName("GET /api/v1/orders/{id} - returns order detail")
    void getOrderById_success() throws Exception {
        when(orderService.getOrderById(501L, 1L)).thenReturn(testOrderResponse);

        mockMvc.perform(get("/api/v1/orders/501")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(501))
                .andExpect(jsonPath("$.data.finalTotal").value(4800.00));
    }

    @Test
    @DisplayName("POST /api/v1/orders/{id}/cancel - cancels order successfully")
    void cancelOrder_success() throws Exception {
        OrderResponse cancelledResponse = OrderResponse.builder()
                .id(501L)
                .orderNumber("GC-ORD-20261123-1234")
                .userId(1L)
                .status(OrderStatus.CANCELLED)
                .paymentStatus("REFUNDED")
                .cancellationFee(new BigDecimal("50.00"))
                .refundAmount(new BigDecimal("4750.00"))
                .cancellationReason("Changed my mind")
                .cancelledAt(LocalDateTime.now())
                .items(List.of())
                .build();

        CancelOrderRequest req = CancelOrderRequest.builder().reason("Changed my mind").build();
        when(orderService.cancelOrder(eq(501L), eq(1L), any(CancelOrderRequest.class))).thenReturn(cancelledResponse);

        mockMvc.perform(post("/api/v1/orders/501/cancel")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CANCELLED"))
                .andExpect(jsonPath("$.data.paymentStatus").value("REFUNDED"))
                .andExpect(jsonPath("$.data.cancellationFee").value(50.00))
                .andExpect(jsonPath("$.data.refundAmount").value(4750.00))
                .andExpect(jsonPath("$.data.cancellationReason").value("Changed my mind"));
    }
}

