# Cart Management and Pricing Calculations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full-stack shopping cart management and authoritative pricing calculation engine across Spring Boot, PostgreSQL/MySQL, and React with dual-pricing resolution, validation constraints, and comprehensive test coverage.

**Architecture:** Layered Spring Boot architecture (`entity` → `repository` → `service` → `controller`) with authoritative recalculation of prices against the database on every cart access, coupled with a responsive React frontend with real-time reactive cart updates, empty states, and price breakdown ledger.

**Tech Stack:** Java 21, Spring Boot 3.3.x, Spring Data JPA, Hibernate, PostgreSQL/MySQL, JUnit 5, Mockito, React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Axios.

## Global Constraints

- Backend must be the sole authority for unit prices, subtotals, discounts, savings, and final totals. Zero trust in client calculations.
- Dual pricing resolution: apply wholesale `Product.groupPrice` if an active `GroupPurchase` pool is open for the product in the user's cluster; otherwise fallback to MRP.
- Household limits and inventory availability enforced on all add/update actions.
- Pre-auth user ownership managed via `X-User-Id` header (default user ID `1L` for Ananya S.), preparing for Phase 7 Spring Security JWT.
- Follow standardized `ApiResponse<T>` envelope for all API endpoints.
- Do not implement real payments or create fake checkout success messages.

---

### Task 1: Backend Domain Entities and Repositories

**Files:**
- Create: `backend/src/main/java/com/gathercart/entity/Cart.java`
- Create: `backend/src/main/java/com/gathercart/entity/CartItem.java`
- Create: `backend/src/main/java/com/gathercart/repository/CartRepository.java`
- Create: `backend/src/main/java/com/gathercart/repository/CartItemRepository.java`

- [ ] **Step 1: Create Cart entity**
Implement `Cart.java` extending `BaseEntity` with `userId`, `sessionId`, `clusterId`, and a one-to-many list of `CartItem`s with orphan removal and cascade.

- [ ] **Step 2: Create CartItem entity**
Implement `CartItem.java` extending `BaseEntity` with `cart`, `product`, `quantity`, and an optional `groupPurchaseId`.

- [ ] **Step 3: Create Spring Data repositories**
Implement `CartRepository.java` (with `findByUserId(Long userId)`, `findBySessionId(String sessionId)`) and `CartItemRepository.java` (with `findByCartIdAndProductId(Long cartId, Long productId)`).

- [ ] **Step 4: Verify entity compilation and repository interfaces**
Run `mvn clean test-compile` to ensure entities and repositories compile without errors.

- [ ] **Step 5: Commit**
`git add backend/src/main/java/com/gathercart/entity/Cart*.java backend/src/main/java/com/gathercart/repository/Cart*.java && git commit -m "feat: add Cart and CartItem entities and repositories"`

---

### Task 2: Backend DTOs

**Files:**
- Create: `backend/src/main/java/com/gathercart/dto/AddToCartRequest.java`
- Create: `backend/src/main/java/com/gathercart/dto/UpdateCartItemRequest.java`
- Create: `backend/src/main/java/com/gathercart/dto/CartItemResponse.java`
- Create: `backend/src/main/java/com/gathercart/dto/CartResponse.java`

- [ ] **Step 1: Create request DTOs**
Implement `AddToCartRequest` (`productId`, `quantity`) and `UpdateCartItemRequest` (`quantity`) with `@NotNull`, `@Min(1)` validation annotations.

- [ ] **Step 2: Create response DTOs**
Implement `CartItemResponse` (including product attributes, unit prices, savings, group status, max allowed qty) and `CartResponse` (including item list, `mrpSubtotal`, `subtotal`, `applicableDiscounts`, `estimatedSavings`, `deliveryFee`, `finalEstimatedTotal`, `deliveryNote`).

- [ ] **Step 3: Verify compilation**
Run `mvn test-compile`.

- [ ] **Step 4: Commit**
`git add backend/src/main/java/com/gathercart/dto/Cart*.java backend/src/main/java/com/gathercart/dto/Add*.java backend/src/main/java/com/gathercart/dto/UpdateCart*.java && git commit -m "feat: add Cart request and response DTOs"`

---

### Task 3: Backend CartService with Authoritative Pricing Engine

**Files:**
- Create: `backend/src/main/java/com/gathercart/service/CartService.java`
- Create: `backend/src/main/java/com/gathercart/service/CartServiceImpl.java`

- [ ] **Step 1: Define CartService interface**
Methods: `getCart(Long userId, String sessionId, Long clusterId)`, `addToCart(Long userId, String sessionId, Long clusterId, AddToCartRequest request)`, `updateQuantity(Long userId, String sessionId, Long itemId, UpdateCartItemRequest request)`, `removeItem(Long userId, String sessionId, Long itemId)`, `clearCart(Long userId, String sessionId)`.

- [ ] **Step 2: Implement CartServiceImpl with authoritative calculation engine**
Implement pricing logic:
1. Re-query all products and active group batches for the user's cluster.
2. Calculate item-level `mrpSubtotal = mrp * quantity`.
3. Resolve group pricing: if active `group_purchase` in status `OPEN`, `appliedUnitPrice = groupPrice`, otherwise `mrp`.
4. Calculate `itemSubtotal = appliedUnitPrice * quantity` and `itemSavings = (mrp - appliedUnitPrice) * quantity`.
5. Aggregate cart-level totals: `mrpSubtotal`, `subtotal`, `applicableDiscounts`, `estimatedSavings`, `deliveryFee = 0.00`, `finalEstimatedTotal`.
6. Enforce product active check and household limits (`quantity <= min(householdLimit, stockQuantity)`).

- [ ] **Step 3: Verify compilation**
Run `mvn test-compile`.

- [ ] **Step 4: Commit**
`git add backend/src/main/java/com/gathercart/service/CartService*.java && git commit -m "feat: implement CartService with authoritative pricing engine"`

---

### Task 4: Backend Unit & Business Logic Tests

**Files:**
- Create: `backend/src/test/java/com/gathercart/service/CartServiceTest.java`

- [ ] **Step 1: Write comprehensive unit tests for CartService**
Cover:
- Retrieve or initialize empty cart.
- Add product to cart with authoritative group discount calculation.
- Increment existing product quantity on subsequent add.
- Update quantity and verify price recalculations.
- Reject invalid quantities (`quantity < 1` or `quantity > householdLimit`).
- Reject unavailable or inactive products.
- Remove item from cart.
- Clear entire cart.
- Authoritative savings and subtotal calculations.

- [ ] **Step 2: Run test suite**
Run `mvn test -Dtest=CartServiceTest` and ensure 100% tests pass.

- [ ] **Step 3: Commit**
`git add backend/src/test/java/com/gathercart/service/CartServiceTest.java && git commit -m "test: add comprehensive CartService unit tests"`

---

### Task 5: Backend REST Controller & API Tests

**Files:**
- Create: `backend/src/main/java/com/gathercart/controller/CartController.java`
- Create: `backend/src/test/java/com/gathercart/controller/CartControllerTest.java`

- [ ] **Step 1: Implement CartController**
Expose `/api/v1/cart` endpoints (`GET /`, `POST /items`, `PUT /items/{id}`, `DELETE /items/{id}`, `DELETE /`) extracting `X-User-Id`, `X-Session-Id`, and `X-Cluster-Id` headers with sensible defaults.

- [ ] **Step 2: Implement Controller integration tests**
Test HTTP status codes, request validation, and response envelopes.

- [ ] **Step 3: Run full backend test suite**
Run `mvn clean test` to ensure all tests pass.

- [ ] **Step 4: Commit**
`git add backend/src/main/java/com/gathercart/controller/CartController.java backend/src/test/java/com/gathercart/controller/CartControllerTest.java && git commit -m "feat: implement CartController with REST tests"`

---

### Task 6: Frontend Types and Cart API Service

**Files:**
- Create: `frontend/src/types/cart.ts`
- Create: `frontend/src/services/cartService.ts`

- [ ] **Step 1: Create TypeScript cart interfaces**
Define `CartItem`, `CartResponse`, `AddToCartPayload`, `UpdateCartPayload` matching backend DTOs.

- [ ] **Step 2: Implement cartService**
Implement methods `getCart()`, `addItem(productId, quantity)`, `updateItem(itemId, quantity)`, `removeItem(itemId)`, `clearCart()` using Axios client with `X-User-Id: 1`.

- [ ] **Step 3: Verify TypeScript compilation**
Run `npm run build` or `npx tsc -b`.

- [ ] **Step 4: Commit**
`git add frontend/src/types/cart.ts frontend/src/services/cartService.ts && git commit -m "feat: add frontend cart types and API client service"`

---

### Task 7: Frontend Header Navigation Cart Counter

**Files:**
- Modify: `frontend/src/layouts/Header.tsx`

- [ ] **Step 1: Add Cart link with live badge in desktop and mobile menus**
Integrate `ShoppingCart` icon in `Header.tsx` linking to `/cart` displaying dynamic item counter badge.

- [ ] **Step 2: Commit**
`git add frontend/src/layouts/Header.tsx && git commit -m "feat: add Cart link and item badge to Header navigation"`

---

### Task 8: Frontend Cart Page (`/cart`)

**Files:**
- Create: `frontend/src/pages/Cart/CartPage.tsx`
- Modify: `frontend/src/pages/index.ts`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Implement CartPage component**
Features:
- Responsive 2-column layout (Items list + sticky Order Summary ledger).
- Product details: image, name, unit label, wholesale badge, savings amount.
- Quantity controls with `QuantitySelector` and limits.
- Remove item action and Clear Cart action.
- Summary ledger: MRP Subtotal, Collective Wholesale Discount (`- ₹X`), Free Hub Delivery, Final Estimated Total.
- Clear callout: *"You are saving ₹Y by pooling with your neighbourhood!"*
- Empty cart state with empty box icon, encouraging message, and CTA to browse offers.
- Alert banner for errors/validation.

- [ ] **Step 2: Register `/cart` route in `App.tsx`**

- [ ] **Step 3: Verify TypeScript build**
Run `npm run build`.

- [ ] **Step 4: Commit**
`git add frontend/src/pages/Cart/CartPage.tsx frontend/src/pages/index.ts frontend/src/App.tsx && git commit -m "feat: implement dedicated CartPage with price breakdown"`

---

### Task 9: Offer Detail & Home Page Integration

**Files:**
- Modify: `frontend/src/pages/OfferDetail/OfferDetailPage.tsx`
- Modify: `frontend/src/pages/Home/HomePage.tsx`

- [ ] **Step 1: Add "Add to Cart" action in OfferDetailPage**
Add an "Add to Cart" button beside "Pledge Units" allowing direct addition to the cart with feedback toast.

- [ ] **Step 2: Verify frontend builds cleanly**
Run `npm run build`.

- [ ] **Step 3: Commit**
`git add frontend/src/pages/OfferDetail/OfferDetailPage.tsx frontend/src/pages/Home/HomePage.tsx && git commit -m "feat: integrate Add to Cart in OfferDetailPage and HomePage"`

---

### Task 10: End-to-End Verification & Testing

- [ ] **Step 1: Run full Maven backend build and tests**
`mvn test`

- [ ] **Step 2: Run frontend build and linter**
`npm run build` and `npm run lint`

- [ ] **Step 3: Verify with real backend execution**
Start backend, perform API requests to verify adding products, updating quantities, recalculating prices, removing products, clearing cart, and checking edge cases.

