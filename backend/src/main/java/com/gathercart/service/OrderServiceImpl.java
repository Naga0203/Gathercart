package com.gathercart.service;

import com.gathercart.dto.OrderItemResponse;
import com.gathercart.dto.OrderResponse;
import com.gathercart.entity.Cart;
import com.gathercart.entity.CartItem;
import com.gathercart.entity.FulfillmentType;
import com.gathercart.entity.Order;
import com.gathercart.entity.OrderItem;
import com.gathercart.entity.OrderStatus;
import com.gathercart.entity.Product;
import com.gathercart.exception.BusinessException;
import com.gathercart.exception.ResourceNotFoundException;
import com.gathercart.repository.CartRepository;
import com.gathercart.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderServiceImpl implements OrderService {

    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final PricingCalculationService pricingCalculationService;

    private static final Random RANDOM = new Random();

    @Override
    public OrderResponse checkout(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException("Cart not found for user: " + userId));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BusinessException("Cannot checkout an empty cart");
        }

        FulfillmentType fulfillmentType = cart.getFulfillmentType() != null
                ? cart.getFulfillmentType()
                : FulfillmentType.STORE_PICKUP;

        if (fulfillmentType == FulfillmentType.HOME_DELIVERY &&
                (cart.getDeliveryAddress() == null || cart.getDeliveryAddress().trim().isBlank())) {
            throw new BusinessException("Delivery address is required for home delivery");
        }

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int randSuffix = 1000 + RANDOM.nextInt(9000);
        String orderNumber = "GC-ORD-" + timestamp + "-" + randSuffix;

        BigDecimal mrpSubtotal = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal subtotal = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        List<PricingCalculationService.DeliveryItemSpec> deliverySpecs = new ArrayList<>();
        List<OrderItem> orderItems = new ArrayList<>();

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .userId(userId)
                .clusterId(cart.getClusterId() != null ? cart.getClusterId() : 1L)
                .fulfillmentType(fulfillmentType)
                .deliveryAddress(cart.getDeliveryAddress())
                .status(OrderStatus.PLACED)
                .paymentMethod("UPI")
                .paymentStatus("PENDING")
                .build();

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            int qty = cartItem.getQuantity();

            deliverySpecs.add(new PricingCalculationService.DeliveryItemSpec(qty, product.getUnitWeightKg()));

            BigDecimal mrpUnit = product.getMrp().setScale(2, RoundingMode.HALF_UP);
            BigDecimal appliedUnit = pricingCalculationService.calculateEffectiveUnitPrice(
                    mrpUnit, product.getVendorCostPrice(), qty
            );

            BigDecimal itemMrpTotal = mrpUnit.multiply(BigDecimal.valueOf(qty)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal itemSub = appliedUnit.multiply(BigDecimal.valueOf(qty)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal itemSavings = itemMrpTotal.subtract(itemSub).setScale(2, RoundingMode.HALF_UP);

            int savingsPercent = 0;
            if (itemMrpTotal.compareTo(BigDecimal.ZERO) > 0) {
                savingsPercent = itemSavings.multiply(BigDecimal.valueOf(100))
                        .divide(itemMrpTotal, 0, RoundingMode.HALF_UP)
                        .intValue();
            }

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .productName(product.getName())
                    .unitLabel(product.getUnitLabel())
                    .imageUrl(product.getImageUrl())
                    .quantity(qty)
                    .mrpUnitPrice(mrpUnit)
                    .appliedUnitPrice(appliedUnit)
                    .itemSubtotal(itemSub)
                    .savingsAmount(itemSavings)
                    .savingsPercent(savingsPercent)
                    .build();

            order.addItem(orderItem);
            orderItems.add(orderItem);

            mrpSubtotal = mrpSubtotal.add(itemMrpTotal);
            subtotal = subtotal.add(itemSub);
        }

        BigDecimal discountAmount = mrpSubtotal.subtract(subtotal).setScale(2, RoundingMode.HALF_UP);
        BigDecimal deliveryFee = pricingCalculationService.calculateDeliveryFee(fulfillmentType, deliverySpecs);
        BigDecimal finalTotal = subtotal.add(deliveryFee).setScale(2, RoundingMode.HALF_UP);

        order.setMrpSubtotal(mrpSubtotal);
        order.setDiscountAmount(discountAmount);
        order.setSubtotal(subtotal);
        order.setDeliveryFee(deliveryFee);
        order.setFinalTotal(finalTotal);

        Order savedOrder = orderRepository.save(order);
        log.info("Created order {} for user {} with total ₹{}", savedOrder.getOrderNumber(), userId, savedOrder.getFinalTotal());

        // Clear cart after successful checkout
        cart.clearItems();
        cartRepository.save(cart);

        return mapToOrderResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        return mapToOrderResponse(order);
    }

    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                        .productName(item.getProductName())
                        .unitLabel(item.getUnitLabel())
                        .imageUrl(item.getImageUrl())
                        .quantity(item.getQuantity())
                        .mrpUnitPrice(item.getMrpUnitPrice())
                        .appliedUnitPrice(item.getAppliedUnitPrice())
                        .itemSubtotal(item.getItemSubtotal())
                        .savingsAmount(item.getSavingsAmount())
                        .savingsPercent(item.getSavingsPercent())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUserId())
                .clusterId(order.getClusterId())
                .fulfillmentType(order.getFulfillmentType())
                .deliveryAddress(order.getDeliveryAddress())
                .status(order.getStatus())
                .mrpSubtotal(order.getMrpSubtotal())
                .discountAmount(order.getDiscountAmount())
                .subtotal(order.getSubtotal())
                .deliveryFee(order.getDeliveryFee())
                .finalTotal(order.getFinalTotal())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .items(itemResponses)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}

