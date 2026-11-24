# Volume Discounting & Home Delivery Pricing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transition GatherCart from batch-waiting to instant volume-discounted ordering (4% at 5 units up to 20% at 25 units, 1–4 retail at 0%), protect vendor margins with a strict cost floor, and provide free store pickup vs. weight/quantity-based home delivery.

**Architecture:** A deterministic `PricingCalculationService` handles discount curves, vendor floor guardrails, and delivery fees. `CartServiceImpl` integrates this engine, updating cart entities and endpoints. Frontend (`OfferDetailPage.tsx` and `CartPage.tsx`) presents live tiered discount badges, quantity selection up to 25, and a fulfillment method toggle.

**Tech Stack:** Java 21, Spring Boot 3.3.5, Spring Data JPA, Spring Security, JUnit 5, Mockito, React 19, TypeScript, Axios, Tailwind CSS.

## Global Constraints
- Quantity per item must be between 1 and 25 ($Q \in [1, 25]$).
- Quantities 1 to 4: 0% discount (retail MRP).
- Quantities 5 to 25: discount scales linearly from 4.0% to 20.0%: $\text{Discount \%} = 4.0 + (Q - 5) \times 0.8$.
- Effective discounted unit price must never drop below $\text{vendorCostPrice} \times 1.05$ (defaulting $\text{vendorCostPrice} = \text{MRP} \times 0.70$).
- Fulfillment `STORE_PICKUP` fee is ₹0.
- Fulfillment `HOME_DELIVERY` fee is $₹40 + \sum(Q_i \times \max(1.0, \text{weightKg}_i) \times ₹10)$.
- Backend endpoints must return `ApiResponse<T>`.
- All backend tests (`mvn test`) and frontend checks (`npm run lint && npm run build`) must pass.

---

### Task 1: Create `PricingCalculationService` & Unit Tests (TDD)

**Files:**
- Create: `backend/src/main/java/com/gathercart/entity/FulfillmentType.java`
- Create: `backend/src/main/java/com/gathercart/service/PricingCalculationService.java`
- Create: `backend/src/test/java/com/gathercart/service/PricingCalculationServiceTest.java`

**Interfaces:**
- Produces:
  - `BigDecimal calculateDiscountPercent(int quantity)`
  - `BigDecimal calculateEffectiveUnitPrice(BigDecimal mrp, BigDecimal vendorCostPrice, int quantity)`
  - `BigDecimal calculateDeliveryFee(FulfillmentType fulfillmentType, List<DeliveryItemSpec> items)`

- [x] **Step 1: Create `FulfillmentType` enum**

Create `backend/src/main/java/com/gathercart/entity/FulfillmentType.java`:
```java
package com.gathercart.entity;

public enum FulfillmentType {
    STORE_PICKUP,
    HOME_DELIVERY
}
```

- [x] **Step 2: Write failing unit test for `PricingCalculationServiceTest`**

Create `backend/src/test/java/com/gathercart/service/PricingCalculationServiceTest.java`:
```java
package com.gathercart.service;

import com.gathercart.entity.FulfillmentType;
import com.gathercart.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PricingCalculationServiceTest {

    private PricingCalculationService pricingService;

    @BeforeEach
    void setUp() {
        pricingService = new PricingCalculationService();
    }

    @Test
    @DisplayName("Quantities 1 to 4 should have 0% discount")
    void testRetailQuantitiesHaveZeroDiscount() {
        assertEquals(new BigDecimal("0.00"), pricingService.calculateDiscountPercent(1));
        assertEquals(new BigDecimal("0.00"), pricingService.calculateDiscountPercent(4));
    }

    @Test
    @DisplayName("Quantity 5 should have 4% discount and 25 should have 20% discount")
    void testWholesaleQuantitiesDiscountCurve() {
        assertEquals(new BigDecimal("4.00"), pricingService.calculateDiscountPercent(5));
        assertEquals(new BigDecimal("8.00"), pricingService.calculateDiscountPercent(10));
        assertEquals(new BigDecimal("12.00"), pricingService.calculateDiscountPercent(15));
        assertEquals(new BigDecimal("16.00"), pricingService.calculateDiscountPercent(20));
        assertEquals(new BigDecimal("20.00"), pricingService.calculateDiscountPercent(25));
    }

    @Test
    @DisplayName("Invalid quantities below 1 or above 25 should throw BusinessException")
    void testInvalidQuantitiesThrowException() {
        assertThrows(BusinessException.class, () -> pricingService.calculateDiscountPercent(0));
        assertThrows(BusinessException.class, () -> pricingService.calculateDiscountPercent(26));
    }

    @Test
    @DisplayName("Vendor cost floor prevents unit price from dropping below vendorCost * 1.05")
    void testVendorFloorProtection() {
        BigDecimal mrp = new BigDecimal("100.00");
        BigDecimal vendorCost = new BigDecimal("85.00"); // 85 * 1.05 = 89.25 floor
        // 20% discount would give 80.00, but floor is 89.25
        BigDecimal price = pricingService.calculateEffectiveUnitPrice(mrp, vendorCost, 25);
        assertEquals(new BigDecimal("89.25"), price);
    }

    @Test
    @DisplayName("Store pickup delivery fee is always 0")
    void testStorePickupIsFree() {
        PricingCalculationService.DeliveryItemSpec item = new PricingCalculationService.DeliveryItemSpec(5, new BigDecimal("2.0"));
        BigDecimal fee = pricingService.calculateDeliveryFee(FulfillmentType.STORE_PICKUP, List.of(item));
        assertEquals(new BigDecimal("0.00"), fee);
    }

    @Test
    @DisplayName("Home delivery fee computes base fee + quantity * weight * 10")
    void testHomeDeliveryFee() {
        // Base: 40 + (5 * 2.0 * 10) = 40 + 100 = 140.00
        PricingCalculationService.DeliveryItemSpec item = new PricingCalculationService.DeliveryItemSpec(5, new BigDecimal("2.0"));
        BigDecimal fee = pricingService.calculateDeliveryFee(FulfillmentType.HOME_DELIVERY, List.of(item));
        assertEquals(new BigDecimal("140.00"), fee);
    }
}
```

- [x] **Step 3: Run test to verify it fails**

Run:
```powershell
mvn test -Dtest=PricingCalculationServiceTest
```
Expected: Compilation failure or missing class `PricingCalculationService`.

- [x] **Step 4: Implement `PricingCalculationService`**

Create `backend/src/main/java/com/gathercart/service/PricingCalculationService.java`:
```java
package com.gathercart.service;

import com.gathercart.entity.FulfillmentType;
import com.gathercart.exception.BusinessException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class PricingCalculationService {

    public static final BigDecimal BASE_DELIVERY_FEE = new BigDecimal("40.00");
    public static final BigDecimal RATE_PER_KG = new BigDecimal("10.00");
    public static final BigDecimal DEFAULT_VENDOR_COST_FACTOR = new BigDecimal("0.70");
    public static final BigDecimal MIN_VENDOR_MARKUP = new BigDecimal("1.05");

    public record DeliveryItemSpec(int quantity, BigDecimal unitWeightKg) {}

    public BigDecimal calculateDiscountPercent(int quantity) {
        if (quantity < 1 || quantity > 25) {
            throw new BusinessException("Order quantity must be between 1 and 25 units per item");
        }
        if (quantity < 5) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        // 4.0 + (quantity - 5) * 0.8
        BigDecimal step = BigDecimal.valueOf(quantity - 5).multiply(new BigDecimal("0.8"));
        return new BigDecimal("4.0").add(step).setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateEffectiveUnitPrice(BigDecimal mrp, BigDecimal vendorCostPrice, int quantity) {
        BigDecimal discountPercent = calculateDiscountPercent(quantity);
        BigDecimal discountFactor = BigDecimal.ONE.subtract(
                discountPercent.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP)
        );
        BigDecimal discountedPrice = mrp.multiply(discountFactor).setScale(2, RoundingMode.HALF_UP);

        BigDecimal effectiveVendorCost = (vendorCostPrice != null && vendorCostPrice.compareTo(BigDecimal.ZERO) > 0)
                ? vendorCostPrice
                : mrp.multiply(DEFAULT_VENDOR_COST_FACTOR);

        BigDecimal priceFloor = effectiveVendorCost.multiply(MIN_VENDOR_MARKUP).setScale(2, RoundingMode.HALF_UP);

        return discountedPrice.max(priceFloor);
    }

    public BigDecimal calculateDeliveryFee(FulfillmentType fulfillmentType, List<DeliveryItemSpec> items) {
        if (fulfillmentType == null || fulfillmentType == FulfillmentType.STORE_PICKUP) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal extraFee = BigDecimal.ZERO;
        if (items != null) {
            for (DeliveryItemSpec item : items) {
                BigDecimal weight = (item.unitWeightKg() != null && item.unitWeightKg().compareTo(BigDecimal.ZERO) > 0)
                        ? item.unitWeightKg()
                        : BigDecimal.ONE;
                BigDecimal itemDelivery = BigDecimal.valueOf(item.quantity())
                        .multiply(weight)
                        .multiply(RATE_PER_KG);
                extraFee = extraFee.add(itemDelivery);
            }
        }

        return BASE_DELIVERY_FEE.add(extraFee).setScale(2, RoundingMode.HALF_UP);
    }
}
```

- [x] **Step 5: Run tests and verify they pass**

Run:
```powershell
mvn test -Dtest=PricingCalculationServiceTest
```
Expected: Tests run: 5, Failures: 0, Errors: 0.

- [x] **Step 6: Commit Task 1**

```powershell
git add backend/src/main/java/com/gathercart/entity/FulfillmentType.java backend/src/main/java/com/gathercart/service/PricingCalculationService.java backend/src/test/java/com/gathercart/service/PricingCalculationServiceTest.java
git commit -m "feat(pricing): implement PricingCalculationService with volume discount curve and delivery fee calculation"
```

---

### Task 2: Update Backend Cart & Product Entities, DTOs & Fulfillment Endpoint

**Files:**
- Modify: `backend/src/main/java/com/gathercart/entity/Cart.java`
- Modify: `backend/src/main/java/com/gathercart/entity/Product.java`
- Create: `backend/src/main/java/com/gathercart/dto/UpdateFulfillmentRequest.java`
- Modify: `backend/src/main/java/com/gathercart/dto/CartResponse.java`
- Modify: `backend/src/main/java/com/gathercart/service/CartService.java`
- Modify: `backend/src/main/java/com/gathercart/service/CartServiceImpl.java`
- Modify: `backend/src/main/java/com/gathercart/controller/CartController.java`
- Test: `backend/src/test/java/com/gathercart/controller/CartControllerTest.java`

**Interfaces:**
- `CartController`:
  - `PUT /api/v1/cart/fulfillment` with `UpdateFulfillmentRequest` -> `ApiResponse<CartResponse>`
- `CartService`:
  - `CartResponse updateFulfillment(Long userId, UpdateFulfillmentRequest request)`

- [x] **Step 1: Update `Cart.java` and `Product.java`**

In `backend/src/main/java/com/gathercart/entity/Cart.java`, add:
```java
    @Enumerated(EnumType.STRING)
    @Column(name = "fulfillment_type", length = 30)
    @Builder.Default
    private FulfillmentType fulfillmentType = FulfillmentType.STORE_PICKUP;

    @Column(name = "delivery_address", length = 500)
    private String deliveryAddress;
```

In `backend/src/main/java/com/gathercart/entity/Product.java`, add:
```java
    @Column(name = "vendor_cost_price", precision = 10, scale = 2)
    private BigDecimal vendorCostPrice;
```

- [x] **Step 2: Create `UpdateFulfillmentRequest.java` and update `CartResponse.java`**

Create `backend/src/main/java/com/gathercart/dto/UpdateFulfillmentRequest.java`:
```java
package com.gathercart.dto;

import com.gathercart.entity.FulfillmentType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateFulfillmentRequest {
    @NotNull(message = "Fulfillment type is required")
    private FulfillmentType fulfillmentType;
    private String deliveryAddress;
}
```

Update `backend/src/main/java/com/gathercart/dto/CartResponse.java` to include:
```java
    private FulfillmentType fulfillmentType;
    private String deliveryAddress;
```

- [x] **Step 3: Update `CartService.java` and `CartServiceImpl.java`**

Add method `CartResponse updateFulfillment(Long userId, UpdateFulfillmentRequest request);` to `CartService.java`.

In `CartServiceImpl.java`:
- Inject `PricingCalculationService`.
- Change `resolveMaxAllowedQuantity`: return constant `25`.
- In `updateFulfillment`:
```java
    @Override
    public CartResponse updateFulfillment(Long userId, UpdateFulfillmentRequest request) {
        Cart cart = getOrCreateCart(userId);
        cart.setFulfillmentType(request.getFulfillmentType());
        if (request.getFulfillmentType() == FulfillmentType.HOME_DELIVERY) {
            cart.setDeliveryAddress(request.getDeliveryAddress());
        }
        cartRepository.save(cart);
        return mapToCartResponse(cart);
    }
```
- In `mapToCartResponse`:
  - Calculate `appliedUnit` using `pricingCalculationService.calculateEffectiveUnitPrice(product.getMrp(), product.getVendorCostPrice(), qty)`.
  - Calculate `deliveryFee` using `pricingCalculationService.calculateDeliveryFee(cart.getFulfillmentType(), deliveryItems)`.
  - Update `deliveryNote`: "Free pickup at Madhapur Community Hub" if `STORE_PICKUP`, or "Home delivery to " + address if `HOME_DELIVERY`.

- [x] **Step 4: Update `CartController.java`**

In `backend/src/main/java/com/gathercart/controller/CartController.java`, add:
```java
    @PutMapping("/fulfillment")
    public ResponseEntity<ApiResponse<CartResponse>> updateFulfillment(
            @Valid @RequestBody UpdateFulfillmentRequest request
    ) {
        User user = currentUser.require();
        CartResponse response = cartService.updateFulfillment(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Fulfillment updated successfully"));
    }
```

- [x] **Step 5: Run tests to verify backend changes**

Run:
```powershell
mvn test -Dtest=CartControllerTest,PricingCalculationServiceTest
```
Expected: PASS.

- [x] **Step 6: Commit Task 2**

```powershell
git add backend/src/main/java/com/gathercart/
git commit -m "feat(cart): wire volume pricing and fulfillment selection into CartService and CartController"
```

---

### Task 3: Update Frontend Types & `cartService.ts`

**Files:**
- Modify: `frontend/src/types/cart.ts`
- Modify: `frontend/src/services/cartService.ts`

- [x] **Step 1: Update `frontend/src/types/cart.ts`**

Add `FulfillmentType` and update `Cart`:
```typescript
export type FulfillmentType = 'STORE_PICKUP' | 'HOME_DELIVERY';

export interface UpdateFulfillmentRequest {
  fulfillmentType: FulfillmentType;
  deliveryAddress?: string;
}

export interface Cart {
  id: number;
  userId?: number;
  sessionId?: string;
  clusterId?: number;
  items: CartItem[];
  totalItems: number;
  itemCount: number;
  mrpSubtotal: number;
  subtotal: number;
  applicableDiscounts: number;
  estimatedSavings: number;
  deliveryFee: number;
  finalEstimatedTotal: number;
  deliveryNote?: string;
  fulfillmentType?: FulfillmentType;
  deliveryAddress?: string;
}
```

- [x] **Step 2: Update `frontend/src/services/cartService.ts`**

Add `updateFulfillment`:
```typescript
  updateFulfillment: async (payload: UpdateFulfillmentRequest): Promise<Cart> => {
    const response = await api.put<ApiResponse<Cart>>('/cart/fulfillment', payload);
    return response.data.data;
  },
```

- [x] **Step 3: Run frontend typecheck**

Run:
```powershell
npm --prefix frontend run build
```
Expected: PASS.

- [x] **Step 4: Commit Task 3**

```powershell
git add frontend/src/types/cart.ts frontend/src/services/cartService.ts
git commit -m "feat(frontend): add fulfillment types and cartService.updateFulfillment"
```

---

### Task 4: Update `OfferDetailPage.tsx` for Volume Tiers (1 to 25)

**Files:**
- Modify: `frontend/src/pages/OfferDetail/OfferDetailPage.tsx`

- [x] **Step 1: Update quantity selector and tier display in `OfferDetailPage.tsx`**

- Allow `QuantitySelector` to go up to `25` (instead of 3).
- Add live helper computation:
  - If $Q < 5$: "Retail Price (0% off) • Add 5+ for volume wholesale savings"
  - If $5 \le Q \le 25$: "Bulk Tier: " + $(4 + (Q - 5) * 0.8).toFixed(1)$ + "% discount applied"
- Display delivery notice:
  - "✓ Free Store Pickup at Community Hub included."
  - "Optional home delivery available at checkout."

- [x] **Step 2: Verify in browser / build**

Run:
```powershell
npm --prefix frontend run build
```
Expected: PASS.

- [x] **Step 3: Commit Task 4**

```powershell
git add frontend/src/pages/OfferDetail/OfferDetailPage.tsx
git commit -m "feat(offer-detail): support quantity up to 25 with dynamic volume discount indicator"
```

---

### Task 5: Update `CartPage.tsx` with Fulfillment Switcher & Updated Ledger

**Files:**
- Modify: `frontend/src/pages/Cart/CartPage.tsx`

- [x] **Step 1: Add Fulfillment Option Switcher and Address Input in `CartPage.tsx`**

- Display a tab/toggle:
  - **[ Store / Hub Pickup (FREE) ]**
  - **[ Home Delivery (+₹...) ]**
- If `HOME_DELIVERY` is selected, show an address input field with a "Save Address" button calling `cartService.updateFulfillment`.
- Update the pricing ledger to display:
  - Catalog MRP Subtotal: ₹...
  - Volume Savings (4%–20%): -₹...
  - Store Pickup (FREE) or Home Delivery Fee: ₹...
  - Estimated Total: ₹...

- [x] **Step 2: Verify build**

Run:
```powershell
npm --prefix frontend run build
```
Expected: PASS.

- [x] **Step 3: Commit Task 5**

```powershell
git add frontend/src/pages/Cart/CartPage.tsx
git commit -m "feat(cart-page): add fulfillment selector and dynamic delivery surcharge ledger"
```

---

### Task 6: Full Verification & Integration Test

- [x] **Step 1: Run all backend tests**

Run:
```powershell
mvn test
```
Expected: All tests pass (0 failures, 0 errors).

- [x] **Step 2: Run frontend lint and production build**

Run:
```powershell
npm --prefix frontend run lint; npm --prefix frontend run build
```
Expected: Lint passes without errors, build succeeds.

