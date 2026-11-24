# Implementation Plan: Batch Group Buying Integration & Critical Bugfixes

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the missing `GroupPurchaseController` (REST API for batches and pledges), wire frontend pledging and active batch tracking to real APIs, fix unauthenticated header cart requests, resolve routing and concurrency bugs, and fix frontend lint/Fast-Refresh warnings (excluding demo user seeding/initializers).

**Architecture:** Spring Boot REST controllers exposing `/api/v1/batches` and `/api/v1/pledges` secured with Spring Security and `CurrentUser`. React services consuming live batch data and updating progress bars, pledge modals, and orders dynamically.

**Tech Stack:** Java 21, Spring Boot 3.3.5, Spring Data JPA, Spring Security, React 19, TypeScript, Axios, Tailwind CSS, JUnit 5, Mockito.

## Global Constraints
- Preserve `DataInitializer.java` user seeds and `RegisterPage.tsx` demo values as explicitly instructed.
- All backend REST controllers must prefix with `/api/v1` and wrap output in `ApiResponse<T>`.
- Public batch browsing allowed; pledging (`POST /batches/{id}/pledge`), modifying, and cancelling require authentication.
- All code must pass `mvn test` and `npm run lint && npm run build`.

---

### Task 1: Add `GroupParticipantRepository` Queries and `GroupPurchaseService` Enhancements

**Files:**
- Modify: `backend/src/main/java/com/gathercart/repository/GroupParticipantRepository.java`
- Modify: `backend/src/main/java/com/gathercart/service/GroupPurchaseService.java`
- Test: `backend/src/test/java/com/gathercart/service/GroupPurchaseServiceTest.java`

**Interfaces:**
- `GroupParticipantRepository`:
  - `List<GroupParticipant> findByUserIdAndStatusNotOrderByPledgedAtDesc(Long userId, GroupParticipantStatus status)`
  - `Optional<GroupParticipant> findByIdWithLock(@Param("id") Long id)`
- `GroupPurchaseService`:
  - `List<GroupParticipantResponse> getUserParticipations(Long userId)`
  - Concurrency & ownership protection in `updateQuantity` and `cancelParticipation`

- [ ] **Step 1: Update GroupParticipantRepository with user lookup and locking**

Add query methods to `GroupParticipantRepository.java`:
```java
    List<GroupParticipant> findByUserIdAndStatusNotOrderByPledgedAtDesc(Long userId, GroupParticipantStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT gp FROM GroupParticipant gp WHERE gp.id = :id")
    Optional<GroupParticipant> findByIdWithLock(@Param("id") Long id);
```

- [ ] **Step 2: Add `getUserParticipations` and enhance concurrency in `GroupPurchaseService.java`**

Implement `getUserParticipations` and ensure `updateQuantity` / `cancelParticipation` lock the participant and verify user ownership.

- [ ] **Step 3: Run service tests**

Run: `mvn test -Dtest=GroupPurchaseServiceTest`
Expected: PASS

---

### Task 2: Create `GroupPurchaseController` and Unit Tests

**Files:**
- Create: `backend/src/main/java/com/gathercart/controller/GroupPurchaseController.java`
- Create: `backend/src/test/java/com/gathercart/controller/GroupPurchaseControllerTest.java`

**Endpoints:**
- `GET /api/v1/batches` - List batches (supports `status`, `filter`, `categoryId`, pagination)
- `GET /api/v1/batches/{id}` - Get batch by ID
- `GET /api/v1/batches/by-product/{productId}` - Get active batch for product
- `GET /api/v1/batches/{id}/participants` - List participants for batch
- `GET /api/v1/batches/my-pledges` - Get current user's pledges (authenticated)
- `POST /api/v1/batches/{id}/pledge` - Join/pledge (authenticated, sets `userId` from `currentUser`)
- `PATCH /api/v1/batches/pledges/{participantId}` - Update pledged quantity (authenticated)
- `DELETE /api/v1/batches/pledges/{participantId}` - Cancel pledge (authenticated)

- [ ] **Step 1: Write `GroupPurchaseControllerTest.java` with MockMvc tests**
- [ ] **Step 2: Implement `GroupPurchaseController.java`**
- [ ] **Step 3: Run `GroupPurchaseControllerTest` and verify all endpoints pass**

---

### Task 3: Fix `HealthController` Double Mapping

**Files:**
- Modify: `backend/src/main/java/com/gathercart/config/WebConfig.java`
- Modify: `backend/src/main/java/com/gathercart/controller/HealthController.java`

- [ ] **Step 1: Update `HealthController` to map `@GetMapping("/health")` and exclude from double prefixing or align with `/api/v1/health`**
- [ ] **Step 2: Verify `HealthControllerTest` or curl check**

---

### Task 4: Frontend Types & `batchService.ts`

**Files:**
- Create: `frontend/src/types/batch.ts`
- Create: `frontend/src/services/batchService.ts`

- [ ] **Step 1: Create `frontend/src/types/batch.ts` matching backend `GroupPurchaseResponse` and `GroupParticipantResponse`**
- [ ] **Step 2: Implement `frontend/src/services/batchService.ts` with methods: `getBatches`, `getBatchById`, `getActiveBatchByProductId`, `getParticipants`, `pledge`, `updateQuantity`, `cancelPledge`, `getMyPledges`**

---

### Task 5: Wire `OfferDetailPage.tsx` and Pledge Modal to Live Batch API

**Files:**
- Modify: `frontend/src/pages/OfferDetail/OfferDetailPage.tsx`

- [ ] **Step 1: Fetch active batch for the product using `batchService.getActiveBatchByProductId(product.id)`**
- [ ] **Step 2: Display dynamic batch progress bar, target quantity, current quantity, and countdown timer**
- [ ] **Step 3: Display dynamic "Local Community Pulse" from `batchService.getParticipants(batch.id)`**
- [ ] **Step 4: Connect Pledge Modal "Confirm Reservation" button to `batchService.pledge` with authentication check**

---

### Task 6: Fix Header Cart 401 Error and Auth-Expired Listener

**Files:**
- Modify: `frontend/src/layouts/Header.tsx`
- Modify: `frontend/src/features/auth/AuthContext.tsx`

- [ ] **Step 1: In `Header.tsx`, only fetch `cartService.getCart()` when `isAuthenticated === true`**
- [ ] **Step 2: In `AuthContext.tsx`, add event listener for `'gathercart:auth-expired'` that triggers `logout()`**

---

### Task 7: Wire `MyOrdersPage.tsx` to Real Pledges API

**Files:**
- Modify: `frontend/src/pages/MyOrders/MyOrdersPage.tsx`

- [ ] **Step 1: Replace hardcoded pledges with live data from `batchService.getMyPledges()`**
- [ ] **Step 2: Support Modify Quantity and Cancel Pledge actions connected to the backend**
- [ ] **Step 3: Show proper loading and empty states**

---

### Task 8: Fix Oxlint Fast Refresh and React Lifecycle Warnings

**Files:**
- Modify: `frontend/src/features/theme/ThemeContext.tsx`
- Modify: `frontend/src/features/auth/AuthContext.tsx`
- Modify: `frontend/src/pages/Home/HomePage.tsx`
- Modify: `frontend/src/pages/Cart/CartPage.tsx`

- [ ] **Step 1: Fix `react/set-state-in-effect` in `AuthContext.tsx`, `HomePage.tsx`, and `CartPage.tsx`**
- [ ] **Step 2: Separate `useTheme` and `getAuthToken` to fix `react/only-export-components`**
- [ ] **Step 3: Run `npm run lint` and verify 0 errors and 0 warnings**

---

### Task 9: Full End-to-End Build & Test Verification

- [ ] **Step 1: Run `mvn clean test` on backend**
- [ ] **Step 2: Run `npm run lint && npm run build` on frontend**

