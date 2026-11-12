package com.gathercart.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gathercart.dto.CreateProductRequest;
import com.gathercart.dto.PageResponse;
import com.gathercart.dto.ProductDetailResponse;
import com.gathercart.dto.ProductSummaryResponse;
import com.gathercart.exception.ResourceNotFoundException;
import com.gathercart.service.ProductService;
import com.gathercart.config.WebConfig;
import com.gathercart.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {ProductController.class, AdminProductController.class})
@Import({WebConfig.class, GlobalExceptionHandler.class})
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductService productService;

    @Test
    @DisplayName("GET /api/v1/products should return paginated list")
    void shouldReturnPaginatedProducts() throws Exception {
        ProductSummaryResponse summary = ProductSummaryResponse.builder()
                .id(1L)
                .name("Sona Masoori Raw Rice")
                .unitLabel("10 kg bag")
                .mrp(new BigDecimal("850.00"))
                .groupPrice(new BigDecimal("649.00"))
                .savingsAmount(new BigDecimal("201.00"))
                .savingsPercent(24)
                .categoryId(1L)
                .categoryName("Rice & Grains")
                .isActive(true)
                .build();

        PageResponse<ProductSummaryResponse> page = PageResponse.<ProductSummaryResponse>builder()
                .content(List.of(summary))
                .page(0)
                .size(12)
                .totalElements(1)
                .totalPages(1)
                .first(true)
                .last(true)
                .build();

        when(productService.getProducts(any(), any(), anyInt(), anyInt(), anyString(), anyString()))
                .thenReturn(page);

        mockMvc.perform(get("/api/v1/products")
                        .param("categoryId", "1")
                        .param("page", "0")
                        .param("size", "12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].name").value("Sona Masoori Raw Rice"))
                .andExpect(jsonPath("$.data.content[0].savingsPercent").value(24))
                .andExpect(jsonPath("$.data.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/v1/products/{id} should return product details")
    void shouldReturnProductDetail() throws Exception {
        ProductDetailResponse detail = ProductDetailResponse.builder()
                .id(1L)
                .name("Sona Masoori Raw Rice")
                .unitLabel("10 kg bag")
                .mrp(new BigDecimal("850.00"))
                .groupPrice(new BigDecimal("649.00"))
                .savingsAmount(new BigDecimal("201.00"))
                .savingsPercent(24)
                .categoryName("Rice & Grains")
                .isActive(true)
                .build();

        when(productService.getProductById(1L)).thenReturn(detail);

        mockMvc.perform(get("/api/v1/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.name").value("Sona Masoori Raw Rice"))
                .andExpect(jsonPath("$.data.savingsAmount").value(201.00));
    }

    @Test
    @DisplayName("GET /api/v1/products/{id} should return 404 when product not found")
    void shouldReturn404WhenNotFound() throws Exception {
        when(productService.getProductById(999L))
                .thenThrow(new ResourceNotFoundException("Product not found with ID: 999"));

        mockMvc.perform(get("/api/v1/products/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Product not found with ID: 999"));
    }

    @Test
    @DisplayName("POST /api/v1/admin/products should validate body and create product")
    void shouldCreateProduct() throws Exception {
        CreateProductRequest request = CreateProductRequest.builder()
                .name("Kashmiri Walnuts")
                .categoryId(4L)
                .unitLabel("2 kg sack")
                .mrp(new BigDecimal("1800.00"))
                .groupPrice(new BigDecimal("1350.00"))
                .build();

        ProductDetailResponse detail = ProductDetailResponse.builder()
                .id(3L)
                .name("Kashmiri Walnuts")
                .unitLabel("2 kg sack")
                .mrp(new BigDecimal("1800.00"))
                .groupPrice(new BigDecimal("1350.00"))
                .savingsAmount(new BigDecimal("450.00"))
                .savingsPercent(25)
                .build();

        when(productService.createProduct(any(CreateProductRequest.class))).thenReturn(detail);

        mockMvc.perform(post("/api/v1/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Kashmiri Walnuts"))
                .andExpect(jsonPath("$.data.savingsPercent").value(25));
    }

    @Test
    @DisplayName("POST /api/v1/admin/products should return 400 when validation fails")
    void shouldReturn400OnValidationFailure() throws Exception {
        CreateProductRequest invalidRequest = CreateProductRequest.builder()
                .name("") // blank name
                .categoryId(null) // missing category
                .mrp(new BigDecimal("-10.00")) // negative
                .build();

        mockMvc.perform(post("/api/v1/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}
