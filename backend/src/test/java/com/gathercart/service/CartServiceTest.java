package com.gathercart.service;

import com.gathercart.dto.AddToCartRequest;
import com.gathercart.dto.CartResponse;
import com.gathercart.dto.UpdateCartItemRequest;
import com.gathercart.entity.Cart;
import com.gathercart.entity.CartItem;
import com.gathercart.entity.Category;
import com.gathercart.entity.GroupPurchase;
import com.gathercart.entity.GroupPurchaseStatus;
import com.gathercart.entity.Product;
import com.gathercart.exception.BusinessException;
import com.gathercart.exception.ResourceNotFoundException;
import com.gathercart.repository.CartItemRepository;
import com.gathercart.repository.CartRepository;
import com.gathercart.repository.GroupPurchaseRepository;
import com.gathercart.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private GroupPurchaseRepository groupPurchaseRepository;

    @InjectMocks
    private CartServiceImpl cartService;

    private Product testProduct;
    private GroupPurchase testGroupPurchase;
    private Cart testCart;

    @BeforeEach
    void setUp() {
        Category category = Category.builder()
                .name("Rice & Grains")
                .icon("🌾")
                .build();
        category.setId(1L);

        testProduct = Product.builder()
                .name("Sona Masoori Raw Rice")
                .description("Aged 12 Months")
                .category(category)
                .unitLabel("10 kg bag")
                .unitWeightKg(new BigDecimal("10.00"))
                .mrp(new BigDecimal("850.00"))
                .groupPrice(new BigDecimal("649.00"))
                .imageUrl("https://example.com/rice.jpg")
                .isActive(true)
                .build();
        testProduct.setId(1L);

        testGroupPurchase = GroupPurchase.builder()
                .batchCode("IND-409")
                .product(testProduct)
                .clusterName("Indiranagar")
                .targetQuantity(25)
                .currentQuantity(20)
                .householdLimit(3)
                .status(GroupPurchaseStatus.OPEN)
                .deadline(LocalDateTime.now().plusDays(2))
                .build();
        testGroupPurchase.setId(10L);

        testCart = Cart.builder()
                .userId(1L)
                .clusterId(1L)
                .items(new ArrayList<>())
                .build();
        testCart.setId(100L);
    }

    @Test
    @DisplayName("getCart - creates new cart when not found")
    void getCart_whenCartNotFound_createsNewCart() {
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(cartRepository.save(any(Cart.class))).thenAnswer(invocation -> {
            Cart c = invocation.getArgument(0);
            c.setId(101L);
            return c;
        });

        CartResponse response = cartService.getCart(1L);

        assertNotNull(response);
        assertEquals(101L, response.getId());
        assertEquals(0, response.getItemCount());
        assertEquals(0, response.getTotalItems());
        assertEquals(new BigDecimal("0.00"), response.getSubtotal());
    }

    @Test
    @DisplayName("addToCart - adds product with active group discount calculated")
    void addToCart_withActiveGroupDiscount_calculatesPricing() {
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(testCart));
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(groupPurchaseRepository.findActiveByProductId(1L)).thenReturn(List.of(testGroupPurchase));
        when(cartItemRepository.save(any(CartItem.class))).thenAnswer(invocation -> {
            CartItem item = invocation.getArgument(0);
            item.setId(201L);
            return item;
        });
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        AddToCartRequest request = AddToCartRequest.builder()
                .productId(1L)
                .quantity(2)
                .build();

        CartResponse response = cartService.addToCart(1L, request);

        assertNotNull(response);
        assertEquals(1, response.getItemCount());
        assertEquals(2, response.getTotalItems());

        // MRP = 850 * 2 = 1700
        assertEquals(new BigDecimal("1700.00"), response.getMrpSubtotal());
        // Applied Group Price = 649 * 2 = 1298
        assertEquals(new BigDecimal("1298.00"), response.getSubtotal());
        // Savings = 1700 - 1298 = 402
        assertEquals(new BigDecimal("402.00"), response.getEstimatedSavings());
        assertEquals(new BigDecimal("402.00"), response.getApplicableDiscounts());
        assertEquals(new BigDecimal("1298.00"), response.getFinalEstimatedTotal());

        assertTrue(response.getItems().get(0).getIsGroupPriceApplied());
        assertEquals("IND-409", response.getItems().get(0).getActiveBatchCode());
        assertEquals(24, response.getItems().get(0).getSavingsPercent());
    }

    @Test
    @DisplayName("addToCart - increments quantity when product is already in cart")
    void addToCart_whenItemAlreadyExists_incrementsQuantity() {
        CartItem existingItem = CartItem.builder()
                .cart(testCart)
                .product(testProduct)
                .quantity(1)
                .build();
        existingItem.setId(201L);
        testCart.addItem(existingItem);

        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(testCart));
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(groupPurchaseRepository.findActiveByProductId(1L)).thenReturn(List.of(testGroupPurchase));
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        AddToCartRequest request = AddToCartRequest.builder()
                .productId(1L)
                .quantity(1)
                .build();

        CartResponse response = cartService.addToCart(1L, request);

        assertEquals(1, response.getItemCount());
        assertEquals(2, response.getTotalItems());
        assertEquals(2, testCart.getItems().get(0).getQuantity());
        verify(cartItemRepository).save(existingItem);
    }

    @Test
    @DisplayName("addToCart - throws exception when product not found")
    void addToCart_productNotFound_throwsException() {
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(testCart));
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        AddToCartRequest request = AddToCartRequest.builder()
                .productId(999L)
                .quantity(1)
                .build();

        assertThrows(ResourceNotFoundException.class, () -> cartService.addToCart(1L, request));
    }

    @Test
    @DisplayName("addToCart - throws exception when product is inactive")
    void addToCart_inactiveProduct_throwsException() {
        testProduct.setIsActive(false);
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(testCart));
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        AddToCartRequest request = AddToCartRequest.builder()
                .productId(1L)
                .quantity(1)
                .build();

        BusinessException ex = assertThrows(BusinessException.class, () -> cartService.addToCart(1L, request));
        assertTrue(ex.getMessage().contains("unavailable"));
    }

    @Test
    @DisplayName("addToCart - throws exception when quantity exceeds limit")
    void addToCart_quantityExceedsLimit_throwsException() {
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(testCart));
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(groupPurchaseRepository.findActiveByProductId(1L)).thenReturn(List.of(testGroupPurchase));

        AddToCartRequest request = AddToCartRequest.builder()
                .productId(1L)
                .quantity(5) // Household limit is 3
                .build();

        BusinessException ex = assertThrows(BusinessException.class, () -> cartService.addToCart(1L, request));
        assertTrue(ex.getMessage().contains("Maximum allowed quantity"));
    }

    @Test
    @DisplayName("updateQuantity - updates quantity and recalculates totals")
    void updateQuantity_validQuantity_updatesAndRecalculates() {
        CartItem item = CartItem.builder()
                .cart(testCart)
                .product(testProduct)
                .quantity(1)
                .build();
        item.setId(201L);
        testCart.addItem(item);

        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(testCart));
        when(groupPurchaseRepository.findActiveByProductId(1L)).thenReturn(List.of(testGroupPurchase));
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        UpdateCartItemRequest request = UpdateCartItemRequest.builder()
                .quantity(3)
                .build();

        CartResponse response = cartService.updateQuantity(1L, 201L, request);

        assertEquals(3, response.getTotalItems());
        assertEquals(3, item.getQuantity());
        verify(cartItemRepository).save(item);
    }

    @Test
    @DisplayName("updateQuantity - removes item when quantity is 0")
    void updateQuantity_zeroQuantity_removesItem() {
        CartItem item = CartItem.builder()
                .cart(testCart)
                .product(testProduct)
                .quantity(2)
                .build();
        item.setId(201L);
        testCart.addItem(item);

        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(testCart));
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        UpdateCartItemRequest request = UpdateCartItemRequest.builder()
                .quantity(0)
                .build();

        CartResponse response = cartService.updateQuantity(1L, 201L, request);

        assertEquals(0, response.getItemCount());
        assertEquals(0, response.getTotalItems());
        verify(cartItemRepository).delete(item);
    }

    @Test
    @DisplayName("removeItem - removes specific item from cart")
    void removeItem_validItem_removesAndRecalculates() {
        CartItem item = CartItem.builder()
                .cart(testCart)
                .product(testProduct)
                .quantity(2)
                .build();
        item.setId(201L);
        testCart.addItem(item);

        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(testCart));
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        CartResponse response = cartService.removeItem(1L, 201L);

        assertEquals(0, response.getItemCount());
        verify(cartItemRepository).delete(item);
    }

    @Test
    @DisplayName("clearCart - clears all items from cart")
    void clearCart_clearsAllItems() {
        CartItem item1 = CartItem.builder().cart(testCart).product(testProduct).quantity(1).build();
        testCart.addItem(item1);

        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(testCart));
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        CartResponse response = cartService.clearCart(1L);

        assertEquals(0, response.getItemCount());
        assertEquals(0, response.getTotalItems());
        assertEquals(new BigDecimal("0.00"), response.getFinalEstimatedTotal());
    }

    @Test
    @DisplayName("pricing - without active group batch falls back to regular MRP")
    void pricing_withoutActiveBatch_usesMrp() {
        CartItem item = CartItem.builder()
                .cart(testCart)
                .product(testProduct)
                .quantity(2)
                .build();
        item.setId(201L);
        testCart.addItem(item);

        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(testCart));
        when(groupPurchaseRepository.findActiveByProductId(1L)).thenReturn(List.of()); // No active batch

        CartResponse response = cartService.getCart(1L);

        // Unit Price should be MRP = 850.00
        assertEquals(new BigDecimal("1700.00"), response.getMrpSubtotal());
        assertEquals(new BigDecimal("1700.00"), response.getSubtotal());
        assertEquals(new BigDecimal("0.00"), response.getEstimatedSavings());
        assertFalse(response.getItems().get(0).getIsGroupPriceApplied());
    }
}

