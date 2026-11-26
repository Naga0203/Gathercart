package com.gathercart.service;

import com.gathercart.dto.CancelOrderRequest;
import com.gathercart.dto.OrderResponse;

import java.util.List;

public interface OrderService {

    OrderResponse checkout(Long userId);

    List<OrderResponse> getUserOrders(Long userId);

    OrderResponse getOrderById(Long orderId, Long userId);

    OrderResponse cancelOrder(Long orderId, Long userId, CancelOrderRequest request);
}

