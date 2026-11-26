package com.gathercart.controller;

import com.gathercart.common.ApiResponse;
import com.gathercart.dto.CancelOrderRequest;
import com.gathercart.dto.OrderResponse;
import com.gathercart.entity.User;
import com.gathercart.security.CurrentUser;
import com.gathercart.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;
    private final CurrentUser currentUser;

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderResponse>> checkout() {
        User user = currentUser.require();
        OrderResponse response = orderService.checkout(user.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Order placed successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getUserOrders() {
        User user = currentUser.require();
        List<OrderResponse> orders = orderService.getUserOrders(user.getId());
        return ResponseEntity.ok(ApiResponse.success(orders, "Orders retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable Long id) {
        User user = currentUser.require();
        OrderResponse order = orderService.getOrderById(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success(order, "Order retrieved successfully"));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable Long id,
            @RequestBody(required = false) CancelOrderRequest request) {
        User user = currentUser.require();
        OrderResponse response = orderService.cancelOrder(id, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Order cancelled successfully"));
    }
}

