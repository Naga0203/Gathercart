# Design Specification: Instant Tiered Volume Discounting & Home Delivery Pricing

**Date:** 2026-11-22  
**Status:** Approved  
**Author:** Antigravity & Engineering Team  
**Scope:** Dynamic Volume Discounting Engine (4% to 20%), Vendor Margin Protection, and Store Pickup vs. Home Delivery Surcharge Model.

---

## 1. Executive Summary

Previously, GatherCart required users to join a batch and wait for a collective target (e.g. 25 units) to unlock group discounts, with individual orders constrained to small household limits (e.g. 3 units).

This specification transitions GatherCart to an **instant tiered volume discounting model**:
1. **Immediate Ordering:** Users do not need to wait for a collective batch to meet target quantities. They can purchase any quantity up to 25 units per item immediately.
2. **Dynamic Volume Discounting (4% to 20%):**
   - Quantities 1–4: Standard retail pricing (0% discount, full MRP).
   - Quantities 5–25: Dynamic volume discount scaling linearly from **4.0%** at 5 units up to **20.0%** at 25 units.
3. **Vendor Profit Guardrails:** Selling price is constrained by a mathematical floor based on vendor cost price plus guaranteed markup, ensuring vendors never incur losses and maximize total profit through higher sales volumes.
4. **Fulfillment Model (Store Pickup vs. Home Delivery):**
   - **Store / Hub Pickup:** Standard and **100% Free** (default).
   - **Home Delivery:** Extra fee charged based on base handling plus item quantity and unit weight.

---

## 2. Business Rules & Mathematical Models

### 2.1 Volume Discount Formula
For an item with Maximum Retail Price (MRP) and selected quantity $Q \in [1, 25]$:

$$\text{Discount \%}(Q) = \begin{cases} 
0\%, & 1 \le Q \le 4 \\
4.0\% + (Q - 5) \times 0.8\%, & 5 \le Q \le 25 
\end{cases}$$

#### Key Tier Benchmarks:
| Quantity ($Q$) | Discount % | Pricing Tier | Purpose |
|---|---|---|---|
| 1 to 4 | 0% | Retail | Low-quantity retail convenience |
| 5 | 4.0% | Wholesale Minimum | Entry threshold for volume pricing |
| 10 | 8.0% | Wholesale Tier 2 | Medium household order |
| 15 | 12.0% | Wholesale Tier 3 | Multi-week pantry stock |
| 20 | 16.0% | Wholesale Tier 4 | Family bulk purchase |
| 25 | 20.0% | Maximum Bulk Discount | Maximum allowed units per order |

Quantities $Q > 25$ or $Q \le 0$ are strictly rejected by the API.

### 2.2 Vendor Profit Maximization & Zero-Loss Protection
To guarantee the vendor never sells at a loss:
- Each product defines a `vendorCostPrice` (defaulting to 70% of MRP if omitted).
- The maximum permissible discount is bounded by:
  $$\text{Effective Unit Price} = \max\Big(\text{MRP} \times (1 - \text{Discount \%}/100), \; \text{vendorCostPrice} \times 1.05\Big)$$
- Because unit margin $(\text{Price} - \text{Cost}) > 0$ for all valid $Q$, the vendor's total profit $\Pi = Q \times (\text{Price} - \text{Cost})$ strictly increases as volume grows from 5 to 25 units.

### 2.3 Fulfillment & Delivery Fee Model
Fulfillment type is chosen per cart:

1. **STORE_PICKUP (Default):**
   - Delivery Fee = **₹0 (FREE)**
   - Orders are routed to the community hub / local store for customer pickup.

2. **HOME_DELIVERY (Optional):**
   - Delivery Fee formula:
     $$\text{Delivery Fee} = \text{Base Fee (₹40)} + \sum_{i=1}^{M} \Big(\text{Quantity}_i \times \max(1.0, \text{WeightKg}_i) \times ₹10/\text{kg}\Big)$$
   - Where:
     - Base Fee = ₹40 (covers logistics dispatch & packaging).
     - Per-Unit Rate = ₹10 per kg (minimum 1 kg per unit if `unitWeightKg` is not specified).

---

## 3. Architecture & Data Model

```mermaid
flowchart TD
    User([Customer]) -->|Selects Qty 1-25 & Fulfillment| CartUI[Cart / Offer Detail Page]
    CartUI -->|API Request| CartController[/api/v1/cart]
    CartController --> CartService[CartServiceImpl]
    CartService --> PricingEngine[PricingCalculationService]
    
    subgraph PricingEngine [Pricing Calculation Service]
        CalcDiscount[Calculate Discount: 4% to 20%]
        CheckVendor[Verify Vendor Cost Floor & Zero Loss]
        CalcFulfillment[Calculate Store Pickup ₹0 vs Home Delivery ₹40 + Weight/Qty]
    end
    
    PricingEngine -->|Authoritative Ledger| CartService
    CartService --> DB[(PostgreSQL Database)]
```

### 3.1 Backend Entity Updates
1. **`Cart` Entity:**
   - `fulfillmentType`: Enum (`STORE_PICKUP`, `HOME_DELIVERY`), defaults to `STORE_PICKUP`.
   - `deliveryAddress`: String (optional, required if `fulfillmentType == HOME_DELIVERY`).
2. **`Product` Entity:**
   - `vendorCostPrice`: BigDecimal (optional, fallback to `mrp * 0.70`).
   - `unitWeightKg`: BigDecimal (existing, used in delivery calculation; fallback 1.0 kg).
3. **`CartItem` Entity:**
   - Quantity range validation relaxed from max 3 to max 25.

### 3.2 DTO & API Changes
1. **`PricingCalculationService`:**
   - New dedicated service providing deterministic calculation for unit price, discounts, vendor margin guardrails, and delivery fees.
2. **`CartResponse`:**
   - `fulfillmentType`: `STORE_PICKUP` | `HOME_DELIVERY`
   - `deliveryAddress`: String
   - `deliveryFee`: BigDecimal (₹0 for pickup; calculated fee for delivery)
   - `finalEstimatedTotal`: `subtotal + deliveryFee`
3. **`CartItemResponse`:**
   - `appliedUnitPrice`: Calculated based on volume discount curve
   - `savingsPercent`: Reflects 0% (qty 1-4) or 4%-20% (qty 5-25)
   - `maxAllowedQuantity`: 25
4. **New Endpoint:**
   - `PUT /api/v1/cart/fulfillment`: Accepts `{ "fulfillmentType": "STORE_PICKUP" | "HOME_DELIVERY", "deliveryAddress": "..." }` to dynamically update cart fulfillment.

---

## 4. Frontend User Experience

1. **Offer Detail (`OfferDetailPage.tsx`):**
   - Quantity selector allows selecting 1 to 25 units.
   - Dynamic badge updating live:
     - 1–4 units: "Retail Price"
     - 5 units: "Bulk Tier Active • 4% off"
     - 15 units: "Bulk Tier Active • 12% off"
     - 25 units: "Maximum Bulk Discount • 20% off"
   - Information card: "Free Store Pickup included. Home Delivery calculated at checkout."
2. **Cart Page (`CartPage.tsx`):**
   - Fulfillment Toggle Switcher:
     - Button 1: **Store / Hub Pickup (FREE)**
     - Button 2: **Home Delivery (+₹...)**
   - Address input when Home Delivery is selected.
   - Price summary ledger showing:
     - Catalog MRP Subtotal
     - Volume Savings (-₹...)
     - Fulfillment / Delivery Fee (₹0 or calculated)
     - Total Estimated Payable

---

## 5. Testing & Verification

1. **`PricingCalculationServiceTest`:**
   - Test quantities 1 to 4 yield 0% discount.
   - Test quantity 5 yields exactly 4.0% discount.
   - Test quantity 15 yields exactly 12.0% discount.
   - Test quantity 25 yields exactly 20.0% discount.
   - Test vendor cost price floor prevents selling below cost + 5% margin.
   - Test Store Pickup fee is ₹0.
   - Test Home Delivery fee includes ₹40 base + weight * qty * ₹10.
2. **`CartServiceImplTest`:**
   - Test adding and updating quantities up to 25.
   - Test rejecting quantities > 25 or <= 0.
   - Test switching fulfillment type between `STORE_PICKUP` and `HOME_DELIVERY`.
3. **Full Integration & Frontend Verification:**
   - Run backend tests: `mvn clean test`
   - Run frontend tests & build: `npm run lint && npm run build`

