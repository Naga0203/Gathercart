package com.gathercart.service;

import com.gathercart.dto.AddToCartRequest;
import com.gathercart.dto.CartResponse;
import com.gathercart.dto.UpdateCartItemRequest;

public interface CartService {

    CartResponse getCart(Long userId, String sessionId, Long clusterId);

    CartResponse addToCart(Long userId, String sessionId, Long clusterId, AddToCartRequest request);

    CartResponse updateQuantity(Long userId, String sessionId, Long clusterId, Long itemId, UpdateCartItemRequest request);

    CartResponse removeItem(Long userId, String sessionId, Long clusterId, Long itemId);

    CartResponse clearCart(Long userId, String sessionId, Long clusterId);
}

