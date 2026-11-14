package com.gathercart.service;

import com.gathercart.dto.AddToCartRequest;
import com.gathercart.dto.CartItemResponse;
import com.gathercart.dto.CartResponse;
import com.gathercart.dto.UpdateCartItemRequest;
import com.gathercart.entity.Cart;
import com.gathercart.entity.CartItem;
import com.gathercart.entity.GroupPurchase;
import com.gathercart.entity.GroupPurchaseStatus;
import com.gathercart.entity.Product;
import com.gathercart.exception.BusinessException;
import com.gathercart.exception.ResourceNotFoundException;
import com.gathercart.repository.CartItemRepository;
import com.gathercart.repository.CartRepository;
import com.gathercart.repository.GroupPurchaseRepository;
import com.gathercart.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final GroupPurchaseRepository groupPurchaseRepository;

    private static final Long DEFAULT_USER_ID = 1L;
    private static final Long DEFAULT_CLUSTER_ID = 1L;
    private static final String DEFAULT_DELIVERY_NOTE = "Free pickup at Indiranagar Community Hub";

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId, String sessionId, Long clusterId) {
        Cart cart = getOrCreateCart(userId, sessionId, clusterId);
        return mapToCartResponse(cart);
    }

    @Override
    public CartResponse addToCart(Long userId, String sessionId, Long clusterId, AddToCartRequest request) {
        Cart cart = getOrCreateCart(userId, sessionId, clusterId);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (Boolean.FALSE.equals(product.getIsActive())) {
            throw new BusinessException("Product '" + product.getName() + "' is currently unavailable");
        }

        int maxAllowed = resolveMaxAllowedQuantity(product);

        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst();

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            if (newQuantity > maxAllowed) {
                throw new BusinessException("Maximum allowed quantity for '" + product.getName() + "' is " + maxAllowed);
            }
            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            if (request.getQuantity() > maxAllowed) {
                throw new BusinessException("Maximum allowed quantity for '" + product.getName() + "' is " + maxAllowed);
            }

            // Bind active group purchase if available
            Long activeGroupPurchaseId = findActiveGroupPurchase(product.getId())
                    .map(GroupPurchase::getId)
                    .orElse(null);

            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .groupPurchaseId(activeGroupPurchaseId)
                    .build();

            cart.addItem(newItem);
            cartItemRepository.save(newItem);
        }

        cartRepository.save(cart);
        return mapToCartResponse(cart);
    }

    @Override
    public CartResponse updateQuantity(Long userId, String sessionId, Long clusterId, Long itemId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(userId, sessionId, clusterId);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        if (request.getQuantity() <= 0) {
            cart.removeItem(item);
            cartItemRepository.delete(item);
        } else {
            Product product = item.getProduct();
            if (Boolean.FALSE.equals(product.getIsActive())) {
                throw new BusinessException("Product '" + product.getName() + "' is currently unavailable");
            }
            int maxAllowed = resolveMaxAllowedQuantity(product);
            if (request.getQuantity() > maxAllowed) {
                throw new BusinessException("Maximum allowed quantity for '" + product.getName() + "' is " + maxAllowed);
            }
            item.setQuantity(request.getQuantity());
            cartItemRepository.save(item);
        }

        cartRepository.save(cart);
        return mapToCartResponse(cart);
    }

    @Override
    public CartResponse removeItem(Long userId, String sessionId, Long clusterId, Long itemId) {
        Cart cart = getOrCreateCart(userId, sessionId, clusterId);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        cart.removeItem(item);
        cartItemRepository.delete(item);
        cartRepository.save(cart);

        return mapToCartResponse(cart);
    }

    @Override
    public CartResponse clearCart(Long userId, String sessionId, Long clusterId) {
        Cart cart = getOrCreateCart(userId, sessionId, clusterId);
        cart.clearItems();
        cartRepository.save(cart);
        return mapToCartResponse(cart);
    }

    private Cart getOrCreateCart(Long userId, String sessionId, Long clusterId) {
        Long resolvedClusterId = clusterId != null ? clusterId : DEFAULT_CLUSTER_ID;

        if (userId != null) {
            return cartRepository.findByUserId(userId)
                    .orElseGet(() -> cartRepository.save(Cart.builder()
                            .userId(userId)
                            .clusterId(resolvedClusterId)
                            .build()));
        }

        if (sessionId != null && !sessionId.trim().isEmpty()) {
            return cartRepository.findBySessionId(sessionId)
                    .orElseGet(() -> cartRepository.save(Cart.builder()
                            .sessionId(sessionId)
                            .clusterId(resolvedClusterId)
                            .build()));
        }

        // Default fallback to pre-auth active user Ananya Sharma
        return cartRepository.findByUserId(DEFAULT_USER_ID)
                .orElseGet(() -> cartRepository.save(Cart.builder()
                        .userId(DEFAULT_USER_ID)
                        .clusterId(resolvedClusterId)
                        .build()));
    }

    private int resolveMaxAllowedQuantity(Product product) {
        Optional<GroupPurchase> activeBatch = findActiveGroupPurchase(product.getId());
        return activeBatch
                .map(GroupPurchase::getHouseholdLimit)
                .orElse(3);
    }

    private Optional<GroupPurchase> findActiveGroupPurchase(Long productId) {
        List<GroupPurchase> activeBatches = groupPurchaseRepository.findActiveByProductId(productId);
        LocalDateTime now = LocalDateTime.now();
        return activeBatches.stream()
                .filter(b -> b.getStatus() == GroupPurchaseStatus.OPEN && b.getDeadline().isAfter(now))
                .findFirst();
    }

    private CartResponse mapToCartResponse(Cart cart) {
        List<CartItemResponse> itemResponses = new ArrayList<>();
        BigDecimal mrpSubtotal = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal subtotal = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        int totalItems = 0;

        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            int qty = item.getQuantity();
            totalItems += qty;

            BigDecimal mrpUnit = product.getMrp().setScale(2, RoundingMode.HALF_UP);
            Optional<GroupPurchase> activeBatch = findActiveGroupPurchase(product.getId());

            boolean isGroupApplied = activeBatch.isPresent();
            String batchCode = activeBatch.map(GroupPurchase::getBatchCode).orElse(null);
            BigDecimal appliedUnit = isGroupApplied
                    ? product.getGroupPrice().setScale(2, RoundingMode.HALF_UP)
                    : mrpUnit;

            BigDecimal itemMrpTotal = mrpUnit.multiply(BigDecimal.valueOf(qty)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal itemSub = appliedUnit.multiply(BigDecimal.valueOf(qty)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal itemSavings = itemMrpTotal.subtract(itemSub).setScale(2, RoundingMode.HALF_UP);

            int savingsPercent = 0;
            if (itemMrpTotal.compareTo(BigDecimal.ZERO) > 0) {
                savingsPercent = itemSavings.multiply(BigDecimal.valueOf(100))
                        .divide(itemMrpTotal, 0, RoundingMode.HALF_UP)
                        .intValue();
            }

            int maxAllowed = resolveMaxAllowedQuantity(product);

            itemResponses.add(CartItemResponse.builder()
                    .id(item.getId())
                    .productId(product.getId())
                    .productName(product.getName())
                    .unitLabel(product.getUnitLabel())
                    .imageUrl(product.getImageUrl())
                    .quantity(qty)
                    .mrpUnitPrice(mrpUnit)
                    .appliedUnitPrice(appliedUnit)
                    .mrpSubtotal(itemMrpTotal)
                    .itemSubtotal(itemSub)
                    .itemSavings(itemSavings)
                    .savingsPercent(savingsPercent)
                    .isGroupPriceApplied(isGroupApplied)
                    .activeBatchCode(batchCode)
                    .maxAllowedQuantity(maxAllowed)
                    .build());

            mrpSubtotal = mrpSubtotal.add(itemMrpTotal);
            subtotal = subtotal.add(itemSub);
        }

        BigDecimal applicableDiscounts = mrpSubtotal.subtract(subtotal).setScale(2, RoundingMode.HALF_UP);
        BigDecimal deliveryFee = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal estimatedSavings = applicableDiscounts;
        BigDecimal finalEstimatedTotal = subtotal.add(deliveryFee).setScale(2, RoundingMode.HALF_UP);

        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUserId())
                .sessionId(cart.getSessionId())
                .clusterId(cart.getClusterId())
                .items(itemResponses)
                .totalItems(totalItems)
                .itemCount(itemResponses.size())
                .mrpSubtotal(mrpSubtotal)
                .subtotal(subtotal)
                .applicableDiscounts(applicableDiscounts)
                .estimatedSavings(estimatedSavings)
                .deliveryFee(deliveryFee)
                .finalEstimatedTotal(finalEstimatedTotal)
                .deliveryNote(DEFAULT_DELIVERY_NOTE)
                .build();
    }
}
