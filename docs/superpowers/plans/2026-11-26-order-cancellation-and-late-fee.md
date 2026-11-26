# Order Cancellation & Late Fee Policy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full-stack order cancellation allowing customers to cancel active orders with an automated 2-hour free cancellation window and a flat ₹50.00 late fee deduction policy.

**Architecture:** Extend Spring Boot `customer_order` JPA entity with cancellation ledger fields, implement time-window evaluation logic in `OrderService`, expose `POST /api/v1/orders/{id}/cancel`, and build an interactive cancellation modal with live fee preview in React.

**Tech Stack:** Java 21, Spring Boot 3.3.5, Hibernate / PostgreSQL (Supabase), JUnit 5 / Mockito, React 18, TypeScript, Tailwind CSS, Lucide React.

## Global Constraints
- Free cancellation window: strictly 2 hours (120 minutes) from `order.createdAt`.
- Late cancellation fee: flat ₹50.00, capped at order `finalTotal`.
- Cancellable states: `PLACED` and `CONFIRMED` only.
- Locked states: `PROCESSING`, `READY_FOR_PICKUP`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED` reject cancellation with `BusinessException` (HTTP 422).
- Ownership: Order must belong to authenticated user (or Admin).

---

### Task 1: Backend Entity & DTO Updates

**Files:**
- Create: `backend/src/main/java/com/gathercart/dto/CancelOrderRequest.java`
- Modify: `backend/src/main/java/com/gathercart/entity/Order.java`
- Modify: `backend/src/main/java/com/gathercart/dto/OrderResponse.java`

**Interfaces:**
- `CancelOrderRequest(String reason)`
- `Order` gains `cancelledAt`, `cancellationFee`, `refundAmount`, `cancellationReason`
- `OrderResponse` gains matching fields

- [ ] **Step 1: Create `CancelOrderRequest.java`**
```java
package com.gathercart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CancelOrderRequest {
    private String reason;
}
```

- [ ] **Step 2: Add cancellation audit fields to `Order.java`**
Add `@Column(name = "cancelled_at") private LocalDateTime cancelledAt;`, `@Column(name = "cancellation_fee", precision = 10, scale = 2) @Builder.Default private BigDecimal cancellationFee = BigDecimal.ZERO;`, `@Column(name = "refund_amount", precision = 10, scale = 2) private BigDecimal refundAmount;`, and `@Column(name = "cancellation_reason", length = 500) private String cancellationReason;`.

- [ ] **Step 3: Update `OrderResponse.java`**
Add `cancellationFee`, `refundAmount`, `cancellationReason`, and `cancelledAt` fields with `@Builder.Default` or getters/setters.

---

### Task 2: Backend OrderService & OrderServiceImpl

**Files:**
- Modify: `backend/src/main/java/com/gathercart/service/OrderService.java`
- Modify: `backend/src/main/java/com/gathercart/service/OrderServiceImpl.java`
- Test: `backend/src/test/java/com/gathercart/service/OrderServiceTest.java`

**Interfaces:**
- `OrderResponse cancelOrder(Long orderId, Long userId, CancelOrderRequest request)`

- [ ] **Step 1: Write unit tests in `OrderServiceTest.java`**
Write tests covering:
- `testCancelOrder_within2Hours_fullRefund()`
- `testCancelOrder_after2Hours_deducts50Fee()`
- `testCancelOrder_after2Hours_feeCappedAtFinalTotal()`
- `testCancelOrder_invalidStatus_throwsBusinessException()`
- `testCancelOrder_nonOwned_throwsResourceNotFound()`

- [ ] **Step 2: Declare `cancelOrder` in `OrderService.java`**
```java
OrderResponse cancelOrder(Long orderId, Long userId, CancelOrderRequest request);
```

- [ ] **Step 3: Implement `cancelOrder` in `OrderServiceImpl.java`**
Validate order ownership, check status is `PLACED` or `CONFIRMED`, compute duration from `createdAt`, calculate fee (0 if <= 120 mins else min(total, 50)), set status to `CANCELLED`, paymentStatus to `REFUNDED`, save order, and return `OrderResponse`.

- [ ] **Step 4: Run unit tests**
Verify all tests pass with `mvn test -Dtest=OrderServiceTest`.

---

### Task 3: Backend OrderController & Integration Tests

**Files:**
- Modify: `backend/src/main/java/com/gathercart/controller/OrderController.java`
- Test: `backend/src/test/java/com/gathercart/controller/OrderControllerTest.java`

**Interfaces:**
- Endpoint: `POST /orders/{id}/cancel`

- [ ] **Step 1: Write MockMvc tests in `OrderControllerTest.java`**
Test `POST /api/v1/orders/{id}/cancel` returns `200 OK` with `ApiResponse<OrderResponse>`.

- [ ] **Step 2: Add `@PostMapping("/{id}/cancel")` to `OrderController.java`**
```java
@PostMapping("/{id}/cancel")
public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
        @PathVariable Long id,
        @RequestBody(required = false) CancelOrderRequest request
) {
    User user = currentUser.require();
    OrderResponse response = orderService.cancelOrder(id, user.getId(), request);
    return ResponseEntity.ok(ApiResponse.success(response, "Order cancelled successfully"));
}
```

- [ ] **Step 3: Run controller tests**
Verify with `mvn test -Dtest=OrderControllerTest`.

---

### Task 4: Frontend Types & orderService

**Files:**
- Modify: `frontend/src/types/order.ts`
- Modify: `frontend/src/services/orderService.ts`

- [ ] **Step 1: Update `types/order.ts`**
Add fields to `Order`:
```typescript
cancellationFee?: number;
refundAmount?: number;
cancellationReason?: string;
cancelledAt?: string;
```
Add `CancelOrderPayload`:
```typescript
export interface CancelOrderPayload {
  reason?: string;
}
```

- [ ] **Step 2: Add `cancelOrder` to `orderService.ts`**
```typescript
cancelOrder: async (id: number | string, payload?: CancelOrderPayload): Promise<Order> => {
  const res = await apiClient.post<ApiResponse<Order>>(`/orders/${id}/cancel`, payload || {});
  if (!res.data.data) {
    throw new Error(res.data.message || 'Failed to cancel order');
  }
  return res.data.data;
},
```

---

### Task 5: Frontend CancelOrderModal Component

**Files:**
- Create: `frontend/src/components/orders/CancelOrderModal.tsx`
- Modify: `frontend/src/components/orders/index.ts` (if index exists) or export directly

- [ ] **Step 1: Create `CancelOrderModal.tsx`**
Build dialog with:
- Elapsed time calculation from `order.createdAt`
- Badge: "Free cancellation (ordered within 2 hours)" or "Late cancellation: ₹50 fee applies"
- Ledger: Order Total, Cancellation Fee (-₹50 or ₹0), Refund Amount
- Reason dropdown / input
- "Keep Order" vs "Confirm Cancellation" buttons

---

### Task 6: Frontend Integration in MyOrdersPage & OrderDetailPage

**Files:**
- Modify: `frontend/src/pages/MyOrders/MyOrdersPage.tsx`
- Modify: `frontend/src/pages/OrderDetail/OrderDetailPage.tsx`

- [ ] **Step 1: Integrate in `MyOrdersPage.tsx`**
- Show "Cancel Order" button for orders with `status === 'PLACED' || status === 'CONFIRMED'`.
- Open `CancelOrderModal`.
- On success, update orders state and show success alert.
- Show `CANCELLED` badge and cancellation fee / refund info on cancelled order cards.

- [ ] **Step 2: Integrate in `OrderDetailPage.tsx`**
- Add "Cancel Order" button in header card if eligible.
- If already cancelled, show cancellation details banner (fee deducted, refund amount, reason, timestamp).

---

### Task 7: Full-Stack Verification & Build

- [ ] **Step 1: Run backend tests** (`mvn test`)
- [ ] **Step 2: Run frontend build** (`npm run build`)
- [ ] **Step 3: End-to-end verification** (Restart backend, test cancel endpoint via script, verify UI)
