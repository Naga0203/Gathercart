package com.gathercart.controller;

import com.gathercart.common.ApiResponse;
import com.gathercart.dto.AddToCartRequest;
import com.gathercart.dto.CartResponse;
import com.gathercart.dto.UpdateCartItemRequest;
import com.gathercart.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @RequestHeader(value = "X-Cluster-Id", required = false) Long clusterId
    ) {
        CartResponse response = cartService.getCart(userId, sessionId, clusterId);
        return ResponseEntity.ok(ApiResponse.success(response, "Cart retrieved successfully"));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @RequestHeader(value = "X-Cluster-Id", required = false) Long clusterId,
            @Valid @RequestBody AddToCartRequest request
    ) {
        CartResponse response = cartService.addToCart(userId, sessionId, clusterId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Item added to cart successfully"));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateQuantity(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @RequestHeader(value = "X-Cluster-Id", required = false) Long clusterId,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        CartResponse response = cartService.updateQuantity(userId, sessionId, clusterId, itemId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Cart item updated successfully"));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @RequestHeader(value = "X-Cluster-Id", required = false) Long clusterId,
            @PathVariable Long itemId
    ) {
        CartResponse response = cartService.removeItem(userId, sessionId, clusterId, itemId);
        return ResponseEntity.ok(ApiResponse.success(response, "Item removed from cart successfully"));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<CartResponse>> clearCart(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @RequestHeader(value = "X-Cluster-Id", required = false) Long clusterId
    ) {
        CartResponse response = cartService.clearCart(userId, sessionId, clusterId);
        return ResponseEntity.ok(ApiResponse.success(response, "Cart cleared successfully"));
    }
}

