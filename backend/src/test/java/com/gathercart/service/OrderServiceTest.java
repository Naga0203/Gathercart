package com.gathercart.service;

import com.gathercart.dto.OrderResponse;
import com.gathercart.entity.Cart;
import com.gathercart.entity.CartItem;
import com.gathercart.entity.Category;
import com.gathercart.entity.FulfillmentType;
import com.gathercart.entity.Order;
import com.gathercart.entity.OrderStatus;
import com.gathercart.entity.Product;
import com.gathercart.exception.BusinessException;
import com.gathercart.exception.ResourceNotFoundException;
import com.gathercart.repository.CartRepository;
import com.gathercart.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private OrderRepository orderRepository;

    @Spy
    private PricingCalculationService pricingCalculationService = new PricingCalculationService();

    @InjectMocks
    private OrderServiceImpl orderService;

    private Product testProduct;
    private Cart testCart;

    @BeforeEach
    void setUp() {
        Category category = Category.builder().name("Staples").build();
        category.setId(1L);

        testProduct = Product.builder()
                .name("Sona Masoori Rice")
                .category(category)
                .unitLabel("10 kg bag")
                .unitWeightKg(new BigDecimal("10.00"))
                .mrp(new BigDecimal("1000.00"))
                .vendorCostPrice(new BigDecimal("700.00"))
                .isActive(true)
                .build();
        testProduct.setId(1L);

        testCart = Cart.builder()
                .userId(1L)
                .clusterId(1L)
                .fulfillmentType(FulfillmentType.STORE_PICKUP)
                .items(new ArrayList<>())
                .build();
        testCart.setId(10L);
    }

    @Test
    @DisplayName("checkout - creates order with volume discount and clears cart for STORE_PICKUP")
    void checkout_storePickup_success() {
        CartItem cartItem = CartItem.builder()
                .cart(testCart)
                .product(testProduct)
                .quantity(5) // 4% discount
                .build();
        cartItem.setId(100L);
        testCart.addItem(cartItem);

        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(testCart));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(500L);
            return o;
        });

        OrderResponse response = orderService.checkout(1L);

        assertNotNull(response);
        assertEquals(500L, response.getId());
        assertEquals(OrderStatus.PLACED, response.getStatus());
        assertEquals(FulfillmentType.STORE_PICKUP, response.getFulfillmentType());

        // 5 * 1000 = 5000 MRP
        assertEquals(new BigDecimal("5000.00"), response.getMrpSubtotal());
        // 4% discount = 40.00 off per 1000 = 960 * 5 = 4800.00
        assertEquals(new BigDecimal("4800.00"), response.getSubtotal());
        assertEquals(new BigDecimal("200.00"), response.getDiscountAmount());
        // Free store pickup
        assertEquals(new BigDecimal("0.00"), response.getDeliveryFee());
        assertEquals(new BigDecimal("4800.00"), response.getFinalTotal());

        // Verify cart cleared
        assertTrue(testCart.getItems().isEmpty());
        verify(cartRepository).save(testCart);
    }

    @Test
    @DisplayName("checkout - home delivery applies surcharge and validates address")
    void checkout_homeDelivery_calculatesFee() {
        testCart.setFulfillmentType(FulfillmentType.HOME_DELIVERY);
        testCart.setDeliveryAddress("Flat 202, Madhapur, Hyderabad");

        CartItem cartItem = CartItem.builder()
                .cart(testCart)
                .product(testProduct)
                .quantity(5)
                .build();
        cartItem.setId(100L);
        testCart.addItem(cartItem);

        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(testCart));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(501L);
            return o;
        });

        OrderResponse response = orderService.checkout(1L);

        assertNotNull(response);
        assertEquals(FulfillmentType.HOME_DELIVERY, response.getFulfillmentType());
        // Delivery fee: 40 + (5 * 10kg * 10) = 40 + 500 = 540.00
        assertEquals(new BigDecimal("540.00"), response.getDeliveryFee());
        // 4800.00 subtotal + 540.00 delivery = 5340.00
        assertEquals(new BigDecimal("5340.00"), response.getFinalTotal());
    }

    @Test
    @DisplayName("checkout - throws BusinessException when cart is empty")
    void checkout_emptyCart_throwsException() {
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(testCart));

        BusinessException ex = assertThrows(BusinessException.class, () -> orderService.checkout(1L));
        assertTrue(ex.getMessage().contains("Cannot checkout an empty cart"));
    }

    @Test
    @DisplayName("checkout - throws BusinessException when HOME_DELIVERY address is missing")
    void checkout_homeDeliveryMissingAddress_throwsException() {
        testCart.setFulfillmentType(FulfillmentType.HOME_DELIVERY);
        testCart.setDeliveryAddress(""); // missing

        CartItem cartItem = CartItem.builder()
                .cart(testCart)
                .product(testProduct)
                .quantity(2)
                .build();
        testCart.addItem(cartItem);

        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(testCart));

        BusinessException ex = assertThrows(BusinessException.class, () -> orderService.checkout(1L));
        assertTrue(ex.getMessage().contains("Delivery address is required"));
    }

    @Test
    @DisplayName("getUserOrders - returns orders for user")
    void getUserOrders_returnsList() {
        Order order = Order.builder()
                .orderNumber("GC-ORD-1")
                .userId(1L)
                .status(OrderStatus.PLACED)
                .mrpSubtotal(new BigDecimal("1000.00"))
                .discountAmount(new BigDecimal("0.00"))
                .subtotal(new BigDecimal("1000.00"))
                .deliveryFee(new BigDecimal("0.00"))
                .finalTotal(new BigDecimal("1000.00"))
                .items(new ArrayList<>())
                .build();
        order.setId(10L);

        when(orderRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(order));

        List<OrderResponse> orders = orderService.getUserOrders(1L);

        assertEquals(1, orders.size());
        assertEquals("GC-ORD-1", orders.get(0).getOrderNumber());
    }

    @Test
    @DisplayName("getOrderById - throws ResourceNotFoundException when not found")
    void getOrderById_notFound_throwsException() {
        when(orderRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> orderService.getOrderById(99L, 1L));
    }
}

