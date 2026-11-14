# GatherCart — Phase 5: Cart Management and Pricing Calculations Design Specification

- **Date**: 2026-11-14
- **Author**: Antigravity Senior Full-Stack Engineer
- **Status**: Approved Design Specification
- **Phase**: 5 (Cart Management and Pricing Calculations)

---

## 1. Executive Summary

GatherCart ("NeighbourBuy") enables community neighbours within residential clusters to pool purchasing power to unlock wholesale pricing directly from regional farmer cooperatives and mills.

In **Phase 5**, we implement the complete shopping cart lifecycle and authoritative pricing calculation engine end-to-end:
1. **Cart & CartItem Entities**: PostgreSQL relational persistence maintaining user cart state and individual product selections.
2. **Authoritative Pricing Engine**: The backend is the single source of truth for all pricing calculations. Totals submitted by clients are strictly ignored; unit prices, group-buying wholesale discounts, cluster delivery fees, savings, and final estimated totals are re-calculated on the fly from database catalog and active group pool state.
3. **Dual Pricing & Group-Aware Pricing**: Automatic resolution of group wholesale discounts if an active group purchase pool exists for that product in the user's cluster.
4. **Validation**: Enforcing product availability, active status, and household/stock quantity limits.
5. **Modern Frontend Experience**: Interactive `/cart` route matching existing design system (Tailwind CSS, Lucide React), dynamic header navigation cart counter badge, item controls, real-time price breakdown card, and empty states.
6. **Pre-Authentication Preparation**: Seamless ownership linkage preparing for Phase 7 Spring Security JWT integration via persistent user/session headers.

---

## 2. Business Rules & Domain Logic

| Rule | Specification |
|---|---|
| **Authoritative Backend Calculations** | The backend computes `mrpSubtotal`, `subtotal`, `applicableDiscounts`, `estimatedSavings`, `deliveryFee`, and `finalEstimatedTotal`. Client calculations are never trusted. |
| **Dual Pricing Resolution** | If an active `group_purchase` (`status = 'OPEN'`) exists for the product in the user's cluster, unit price = `product.groupPrice`. Otherwise, unit price = `product.mrp`. |
| **Quantity Validation** | Each cart item must have `quantity >= 1` and `quantity <= min(product.householdLimit, 10)`. Updating to `0` or negative removes the item or returns a validation error. |
| **Product Availability** | Products must be active (`isActive = true`). If a product becomes inactive or unavailable, the cart flags the item or rejects adding it. |
| **Item Deduplication** | Adding a product already in the cart increments its existing quantity up to the allowed maximum limit rather than creating duplicate lines. |
| **Free Hub Delivery** | Standard hub pickup within the cluster is ₹0.00; delivery fees are authoritative and clearly broken down in the summary ledger. |
| **Clear Cart** | Users can clear the entire cart in a single atomic action. |
| **No Real Payments or Fake Successes** | In accordance with Phase 5 guidelines, checkout flows do not execute mock credit cards or simulate fake completed orders. |

---

## 3. Database Schema & Entities

### 3.1 `Cart` Entity (`cart` table)

```sql
CREATE TABLE cart (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id                 BIGINT NULL,
    session_id              VARCHAR(100) NULL,
    cluster_id              BIGINT NOT NULL DEFAULT 1,
    status                  VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at              DATETIME NOT NULL,
    updated_at              DATETIME NOT NULL,
    CONSTRAINT uk_cart_user UNIQUE (user_id),
    CONSTRAINT uk_cart_session UNIQUE (session_id)
);

CREATE INDEX idx_cart_user ON cart(user_id);
CREATE INDEX idx_cart_session ON cart(session_id);
```

### 3.2 `CartItem` Entity (`cart_item` table)

```sql
CREATE TABLE cart_item (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id                 BIGINT NOT NULL,
    product_id              BIGINT NOT NULL,
    quantity                INT NOT NULL DEFAULT 1,
    created_at              DATETIME NOT NULL,
    updated_at              DATETIME NOT NULL,
    CONSTRAINT fk_cart_item_cart FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_item_product FOREIGN KEY (product_id) REFERENCES product(id),
    CONSTRAINT uk_cart_item_product UNIQUE (cart_id, product_id),
    CONSTRAINT chk_cart_item_quantity CHECK (quantity > 0)
);

CREATE INDEX idx_cart_item_cart ON cart_item(cart_id);
CREATE INDEX idx_cart_item_product ON cart_item(product_id);
```

---

## 4. API Contract & DTOs

### 4.1 Endpoints

- `GET /api/v1/cart` — Retrieve the user's cart with re-calculated pricing breakdown.
- `POST /api/v1/cart/items` — Add a product to the cart: `{ "productId": Long, "quantity": Integer }`.
- `PUT /api/v1/cart/items/{itemId}` — Update item quantity: `{ "quantity": Integer }`.
- `DELETE /api/v1/cart/items/{itemId}` — Remove item from cart.
- `DELETE /api/v1/cart` — Clear all items from cart.

### 4.2 Data Models

#### `CartResponse`
```json
{
  "id": 1,
  "userId": 1,
  "clusterId": 1,
  "items": [
    {
      "id": 1,
      "productId": 1,
      "productName": "Sona Masoori Raw Rice",
      "unitLabel": "10 kg bag",
      "imageUrl": "https://...",
      "quantity": 2,
      "mrpUnitPrice": 850.00,
      "appliedUnitPrice": 649.00,
      "mrpSubtotal": 1700.00,
      "itemSubtotal": 1298.00,
      "itemSavings": 402.00,
      "savingsPercent": 24,
      "isGroupPriceApplied": true,
      "activeBatchCode": "IND-409",
      "maxAllowedQuantity": 3
    }
  ],
  "totalItems": 2,
  "itemCount": 1,
  "mrpSubtotal": 1700.00,
  "subtotal": 1298.00,
  "applicableDiscounts": 402.00,
  "estimatedSavings": 402.00,
  "deliveryFee": 0.00,
  "finalEstimatedTotal": 1298.00,
  "deliveryNote": "Free pickup at Indiranagar Community Hub"
}
```

---

## 5. Frontend Architecture

1. **Header Cart Badge (`frontend/src/layouts/Header.tsx`)**:
   - Navigation link to `/cart` displaying shopping cart icon and dynamic item count badge.
2. **Cart Context / Service (`frontend/src/services/cartService.ts`)**:
   - Centralized API methods with optimistic UI or instant re-fetch on mutations.
3. **Cart Page (`frontend/src/pages/Cart/CartPage.tsx`)**:
   - Active item list with thumbnail, product title, unit specification, group discount pill.
   - Interactive `QuantitySelector` with validation constraints.
   - Remove item button with instant update.
   - Price breakdown ledger (MRP, Collective Wholesale Discount, Delivery, Final Total).
   - Empty cart state with "Browse Active Offers" CTA.
   - Product detail page integration: "Add to Cart" alongside "Pledge".

---

## 6. Testing Strategy

1. **Unit & Integration Tests (Spring Boot)**:
   - CartServiceTest: Adding products, incrementing existing product quantity, updating quantity, removing items, clearing cart.
   - Pricing Calculations: Authoritative calculations of subtotal, discounts, savings, and final total.
   - Validation Tests: Rejecting non-existent products, inactive products, negative or zero quantities, and exceeding household limits.
   - REST Controller Tests: API contract compliance for all `/api/v1/cart` endpoints.
2. **Frontend Verification**:
   - End-to-end cart flow: Adding from offer detail or home, viewing cart, adjusting quantity, removing item, clearing cart, empty state, and checking price re-computation.
