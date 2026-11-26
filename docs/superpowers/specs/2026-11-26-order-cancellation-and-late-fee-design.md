# Design Specification: Order Cancellation & Late Fee Policy

**Date**: 2026-11-26  
**Status**: Approved  
**Author**: Antigravity Engineering  
**Scope**: Full-Stack (Backend Spring Boot + Supabase PostgreSQL + Frontend React TypeScript)

---

## 1. Problem Statement & Motivation

Currently, customers who checkout from their cart have their orders placed in `customer_order` with status `PLACED`, but the application lacks an order cancellation mechanism. Customers cannot cancel or withdraw an active order from `MyOrdersPage` or `OrderDetailPage`. 

Furthermore, once an order is placed, packaging, inventory reservation, and hub dispatch logistics begin. To balance customer flexibility with cooperative fulfillment costs, GatherCart needs a structured, fair cancellation policy:
1. **Free Cancellation Window**: Full refund / fee waiver if cancelled within **2 hours** of ordering.
2. **Late Cancellation Window**: If cancelled after 2 hours (while still in `PLACED` or `CONFIRMED` status), a flat **₹50.00** logistics and restocking fee is deducted, refunding the net remaining balance.
3. **Locked State**: Once an order moves into `PROCESSING`, `READY_FOR_PICKUP`, `OUT_FOR_DELIVERY`, or `DELIVERED`, cancellation is prohibited to prevent logistics wastage and food spoilage.

---

## 2. Business Rules & Logic

### 2.1 State Matrix & Eligibility

| Order Status | Cancellation Eligible? | Fee Policy |
|---|---|---|
| `PLACED` (within 2h) | ✅ Yes | ₹0.00 (Full refund) |
| `PLACED` (after 2h) | ✅ Yes | ₹50.00 fee deducted |
| `CONFIRMED` (within 2h) | ✅ Yes | ₹0.00 (Full refund) |
| `CONFIRMED` (after 2h) | ✅ Yes | ₹50.00 fee deducted |
| `PROCESSING` | ❌ No | Order locked (packaging commenced) |
| `READY_FOR_PICKUP` | ❌ No | Order at community hub |
| `OUT_FOR_DELIVERY` | ❌ No | In transit |
| `DELIVERED` | ❌ No | Order complete |
| `CANCELLED` | ❌ No | Already cancelled |

### 2.2 Time Calculation
- `elapsedDuration = Duration.between(order.getCreatedAt(), LocalDateTime.now())`
- `isFreeWindow = elapsedDuration.toMinutes() <= 120` (2 hours)
- If `isFreeWindow`:
  - `cancellationFee = 0.00`
  - `refundAmount = order.getFinalTotal()`
- If not `isFreeWindow`:
  - `cancellationFee = min(order.getFinalTotal(), 50.00)`
  - `refundAmount = order.getFinalTotal() - cancellationFee`

---

## 3. Database Schema Changes

Table: `customer_order` (Entity: [Order.java](file:///d:/GatherCart/backend/src/main/java/com/gathercart/entity/Order.java))

```sql
ALTER TABLE customer_order
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS cancellation_fee NUMERIC(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS refund_amount NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR(500);
```

### JPA Entity Fields
```java
@Column(name = "cancelled_at")
private LocalDateTime cancelledAt;

@Column(name = "cancellation_fee", precision = 10, scale = 2)
@Builder.Default
private BigDecimal cancellationFee = BigDecimal.ZERO;

@Column(name = "refund_amount", precision = 10, scale = 2)
private BigDecimal refundAmount;

@Column(name = "cancellation_reason", length = 500)
private String cancellationReason;
```

---

## 4. Backend Architecture & API Contract

### 4.1 Endpoint
- **Method**: `POST`
- **Path**: `/api/v1/orders/{id}/cancel`
- **Security**: Requires authentication (User must be the owner of the order or an ADMIN).

### 4.2 Request Body
```json
{
  "reason": "Changed my mind / Ordered by mistake"
}
```
*(Reason is optional; defaults to `"Customer requested cancellation"` if blank).*

### 4.3 Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderNumber": "GC-ORD-20261124171626-5225",
    "status": "CANCELLED",
    "paymentStatus": "REFUNDED",
    "mrpSubtotal": 5600.00,
    "subtotal": 5300.00,
    "discountAmount": 300.00,
    "deliveryFee": 40.00,
    "finalTotal": 5340.00,
    "cancellationFee": 50.00,
    "refundAmount": 5290.00,
    "cancellationReason": "Changed my mind",
    "cancelledAt": "2026-11-26T17:15:00Z",
    "items": [...]
  },
  "message": "Order cancelled successfully. Refund of ₹5,290.00 has been initiated.",
  "timestamp": "2026-11-26T17:15:00.123Z"
}
```

### 4.4 Error Responses
- **`404 Not Found`**: Order ID does not exist or does not belong to the authenticated user.
- **`422 Unprocessable Entity`**:
  - `"Order cannot be cancelled in status: PROCESSING"`
  - `"Order is already cancelled"`

---

## 5. DTO & Model Updates

### 5.1 Backend `OrderResponse.java`
Add fields:
- `cancellationFee` (`BigDecimal`)
- `refundAmount` (`BigDecimal`)
- `cancellationReason` (`String`)
- `cancelledAt` (`LocalDateTime`)

### 5.2 Frontend `types/order.ts`
Add fields:
- `cancellationFee?: number;`
- `refundAmount?: number;`
- `cancellationReason?: string;`
- `cancelledAt?: string;`

---

## 6. Frontend UI / UX Architecture

### 6.1 `CancelOrderModal` Component
A dedicated modal dialog triggered by clicking "Cancel Order":
- **Header**: "Cancel Order #GC-ORD-..."
- **Time Elapsed Indicator**:
  - Shows how long ago the order was created (e.g. *"Placed 35 minutes ago"* or *"Placed 3 hours ago"*).
- **Policy Pill**:
  - If `<= 120 minutes`: Green badge: *"Free Cancellation Window Active (100% Refund)"*.
  - If `> 120 minutes`: Amber badge: *"Late Cancellation Fee: ₹50.00 will be deducted"*.
- **Summary Ledger**:
  - Order Final Total: `₹X`
  - Cancellation / Restocking Fee: `-₹50.00` (or `₹0.00`)
  - **Net Refund Amount**: `₹(X - fee)`
- **Reason Selector / Input**: Pre-populated choices (e.g. "Ordered duplicate item", "Need to change delivery address", "Financial constraints") + optional custom note.
- **Action Buttons**:
  - Secondary: "Keep My Order" (closes modal)
  - Destructive: "Confirm Cancellation" (calls API, disables button, displays loading spinner)

### 6.2 Entry Points
1. **[MyOrdersPage.tsx](file:///d:/GatherCart/frontend/src/pages/MyOrders/MyOrdersPage.tsx)**:
   - For orders with `status === 'PLACED' || status === 'CONFIRMED'`: Render a secondary/outline "Cancel Order" button next to "View Order & Handover Details".
   - When order is in `status === 'CANCELLED'`: Render a red badge `CANCELLED` and show refund info.
2. **[OrderDetailPage.tsx](file:///d:/GatherCart/frontend/src/pages/OrderDetail/OrderDetailPage.tsx)**:
   - Render a "Cancel Order" action button in the Order Header action bar.
   - For cancelled orders, render an alert box detailing:
     - Date & time cancelled.
     - Cancellation fee deducted (if any).
     - Refund confirmation & reference.

---

## 7. Verification & Test Plan

1. **Unit Tests (`OrderServiceTest.java`)**:
   - Order cancelled within 2 hours: fee is `0.00`, refund is `finalTotal`, status `CANCELLED`.
   - Order cancelled after 2 hours: fee is `50.00`, refund is `finalTotal - 50.00`, status `CANCELLED`.
   - Order cancelled after 2 hours when `finalTotal < 50.00`: fee capped at `finalTotal`, refund is `0.00`.
   - Attempting to cancel order in `PROCESSING`, `OUT_FOR_DELIVERY`, `DELIVERED`, or `CANCELLED`: throws `BusinessException`.
   - Attempting to cancel non-owned order: throws `ResourceNotFoundException`.
2. **Controller Tests (`OrderControllerTest.java`)**:
   - `POST /api/v1/orders/1/cancel` returns 200 with cancellation envelope.
   - Unauthorized access returns 401.
3. **Frontend Integration Verification**:
   - Cancel button appears on active orders in `MyOrdersPage` and `OrderDetailPage`.
   - Modal dynamically calculates elapsed time and preview fee.
   - Cancelling updates order card and moves it into cancelled state with proper notification toast.
