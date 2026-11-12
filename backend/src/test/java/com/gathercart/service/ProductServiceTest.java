package com.gathercart.service;

import com.gathercart.dto.CreateProductRequest;
import com.gathercart.dto.PageResponse;
import com.gathercart.dto.ProductDetailResponse;
import com.gathercart.dto.ProductSummaryResponse;
import com.gathercart.entity.Category;
import com.gathercart.entity.CoopProfile;
import com.gathercart.entity.Product;
import com.gathercart.exception.BusinessException;
import com.gathercart.exception.ResourceNotFoundException;
import com.gathercart.repository.CategoryRepository;
import com.gathercart.repository.CoopProfileRepository;
import com.gathercart.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private CoopProfileRepository coopProfileRepository;

    @InjectMocks
    private ProductService productService;

    private Category testCategory;
    private CoopProfile testCoop;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        testCategory = Category.builder()
                .name("Rice & Grains")
                .icon("🌾")
                .displayOrder(1)
                .isActive(true)
                .build();
        testCategory.setId(1L);

        testCoop = CoopProfile.builder()
                .coopIdCode("KA-RAI-048")
                .name("Raichur Co-op")
                .location("Raichur")
                .isVerified(true)
                .build();
        testCoop.setId(1L);

        testProduct = Product.builder()
                .name("Sona Masoori Raw Rice")
                .description("Aged 12 Months")
                .category(testCategory)
                .coopProfile(testCoop)
                .unitLabel("10 kg bag")
                .mrp(new BigDecimal("850.00"))
                .groupPrice(new BigDecimal("649.00"))
                .isActive(true)
                .build();
        testProduct.setId(1L);
    }

    @Test
    @DisplayName("Should retrieve paginated products with category and search filter")
    @SuppressWarnings("unchecked")
    void shouldGetProductsPaginated() {
        when(productRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(testProduct)));

        PageResponse<ProductSummaryResponse> response = productService.getProducts(1L, "rice", 0, 10, "price", "asc");

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        ProductSummaryResponse summary = response.getContent().get(0);
        assertEquals("Sona Masoori Raw Rice", summary.getName());
        assertEquals(new BigDecimal("201.00"), summary.getSavingsAmount());
        assertEquals(24, summary.getSavingsPercent());
    }

    @Test
    @DisplayName("Should retrieve product details by ID")
    void shouldGetProductById() {
        when(productRepository.findByIdAndIsActiveTrue(1L)).thenReturn(Optional.of(testProduct));

        ProductDetailResponse response = productService.getProductById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Sona Masoori Raw Rice", response.getName());
        assertEquals("Rice & Grains", response.getCategoryName());
        assertEquals("Raichur Co-op", response.getCoopProfile().getName());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when product does not exist")
    void shouldThrowWhenProductNotFound() {
        when(productRepository.findByIdAndIsActiveTrue(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.getProductById(999L));
    }

    @Test
    @DisplayName("Should throw BusinessException when group price exceeds MRP on create")
    void shouldThrowWhenGroupPriceExceedsMrpOnCreate() {
        CreateProductRequest request = CreateProductRequest.builder()
                .name("Invalid Product")
                .categoryId(1L)
                .unitLabel("1 kg")
                .mrp(new BigDecimal("100.00"))
                .groupPrice(new BigDecimal("150.00"))
                .build();

        BusinessException ex = assertThrows(BusinessException.class, () -> productService.createProduct(request));
        assertTrue(ex.getMessage().contains("cannot be higher than regular MRP"));
    }

    @Test
    @DisplayName("Should throw BusinessException when MRP is zero or negative")
    void shouldThrowWhenMrpIsZero() {
        CreateProductRequest request = CreateProductRequest.builder()
                .name("Invalid Product")
                .categoryId(1L)
                .unitLabel("1 kg")
                .mrp(BigDecimal.ZERO)
                .groupPrice(new BigDecimal("50.00"))
                .build();

        BusinessException ex = assertThrows(BusinessException.class, () -> productService.createProduct(request));
        assertTrue(ex.getMessage().contains("MRP must be greater than zero"));
    }

    @Test
    @DisplayName("Should create product successfully when valid")
    void shouldCreateProductSuccessfully() {
        CreateProductRequest request = CreateProductRequest.builder()
                .name("Organic Brown Rice")
                .description("Nutritious unpolished rice")
                .categoryId(1L)
                .coopProfileId(1L)
                .unitLabel("5 kg bag")
                .unitWeightKg(new BigDecimal("5.00"))
                .mrp(new BigDecimal("500.00"))
                .groupPrice(new BigDecimal("400.00"))
                .imageUrl("https://images.example.com/rice.png")
                .galleryImageUrls(List.of("https://images.example.com/gallery1.png"))
                .build();

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));
        when(coopProfileRepository.findById(1L)).thenReturn(Optional.of(testCoop));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product p = invocation.getArgument(0);
            p.setId(2L);
            return p;
        });

        ProductDetailResponse response = productService.createProduct(request);

        assertNotNull(response);
        assertEquals(2L, response.getId());
        assertEquals("Organic Brown Rice", response.getName());
        assertEquals(new BigDecimal("100.00"), response.getSavingsAmount());
        assertEquals(20, response.getSavingsPercent());
    }

    @Test
    @DisplayName("Should deactivate product successfully")
    void shouldDeactivateProduct() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        productService.deactivateProduct(1L);

        verify(productRepository).save(testProduct);
        assertEquals(false, testProduct.getIsActive());
    }
}

