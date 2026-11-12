# Group Buying and Group Participation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement end-to-end group-buying functionality across Spring Boot, MySQL/PostgreSQL, and React with atomic concurrency control, authoritative business calculations, status automation, and UI matching reference screens.

**Architecture:** Layered Spring Boot backend (`entity` → `repository` → `service` → `controller`) using JPA `@Lock(LockModeType.PESSIMISTIC_WRITE)` on group purchase rows to enforce strict quota integrity without over-subscription, alongside a modular React frontend connecting home offer browsing, offer detail batch tracking, and the collective join pledge modal.

**Tech Stack:** Java 21, Spring Boot 3.3.x, Spring Data JPA, Hibernate, MySQL/PostgreSQL, React 19, Vite, TypeScript, Tailwind CSS, Lucide React, Axios.

## Global Constraints

- Backend must be the sole authority for prices, quantities, remaining units, and status transitions.
- Zero client-side calculation trust: upfront amount is always ₹0; savings and totals computed from `Product`.
- Strict concurrency control: pessimistic locking on `GroupPurchase` row during joins/updates/cancellations.
- Household limit enforced per user and per phone number.
- Follow existing response envelope: `ApiResponse<T>`.

---

### Task 1: Backend Domain Entities and Repositories

**Files:**
- Create: `backend/src/main/java/com/gathercart/entity/GroupPurchaseStatus.java`
- Create: `backend/src/main/java/com/gathercart/entity/GroupParticipantStatus.java`
- Create: `backend/src/main/java/com/gathercart/entity/GroupPurchase.java`
- Create: `backend/src/main/java/com/gathercart/entity/GroupParticipant.java`
- Create: `backend/src/main/java/com/gathercart/repository/GroupPurchaseRepository.java`
- Create: `backend/src/main/java/com/gathercart/repository/GroupParticipantRepository.java`

**Interfaces:**
- Produces: `GroupPurchase` entity, `GroupParticipant` entity, `GroupPurchaseRepository.findByIdWithLock(Long id)` with `@Lock(LockModeType.PESSIMISTIC_WRITE)`.

- [ ] **Step 1: Write entities and enums**

Create `GroupPurchaseStatus.java`:
```java
package com.gathercart.entity;

public enum GroupPurchaseStatus {
    OPEN,
    CONFIRMED,
    DISPATCHED,
    DELIVERED,
    EXPIRED,
    CANCELLED
}
```

Create `GroupParticipantStatus.java`:
```java
package com.gathercart.entity;

public enum GroupParticipantStatus {
    ACTIVE,
    PAYMENT_PENDING,
    PAID,
    CANCELLED,
    RELEASED
}
```

Create `GroupPurchase.java`:
```java
package com.gathercart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "group_purchase")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupPurchase extends BaseEntity {

    @Column(name = "batch_code", nullable = false, unique = true, length = 50)
    private String batchCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "cluster_name", length = 100)
    private String clusterName;

    @Column(name = "target_quantity", nullable = false)
    private Integer targetQuantity;

    @Column(name = "current_quantity", nullable = false)
    @Builder.Default
    private Integer currentQuantity = 0;

    @Column(name = "household_limit", nullable = false)
    @Builder.Default
    private Integer householdLimit = 3;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private GroupPurchaseStatus status = GroupPurchaseStatus.OPEN;

    @Column(name = "deadline", nullable = false)
    private LocalDateTime deadline;

    @Column(name = "payment_window_mins", nullable = false)
    @Builder.Default
    private Integer paymentWindowMins = 10;

    @Column(name = "payment_deadline")
    private LocalDateTime paymentDeadline;

    @Column(name = "lead_organiser", length = 150)
    private String leadOrganiser;

    @Column(name = "hub_drop_location", length = 255)
    private String hubDropLocation;

    @Column(name = "is_free_delivery", nullable = false)
    @Builder.Default
    private Boolean isFreeDelivery = true;

    @OneToMany(mappedBy = "groupPurchase", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GroupParticipant> participants = new ArrayList<>();
}
```

Create `GroupParticipant.java`:
```java
package com.gathercart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "group_participant")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupParticipant extends BaseEntity {

    @Column(name = "commitment_code", nullable = false, unique = true, length = 50)
    private String commitmentCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_purchase_id", nullable = false)
    private GroupPurchase groupPurchase;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "location", length = 100)
    private String location;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "mrp_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal mrpTotal;

    @Column(name = "savings", nullable = false, precision = 10, scale = 2)
    private BigDecimal savings;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private GroupParticipantStatus status = GroupParticipantStatus.ACTIVE;

    @Column(name = "pledged_at", nullable = false)
    private LocalDateTime pledgedAt;

    @Column(name = "payment_due_at")
    private LocalDateTime paymentDueAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;
}
```

- [ ] **Step 2: Write repositories with pessimistic locking**

Create `GroupPurchaseRepository.java`:
```java
package com.gathercart.repository;

import com.gathercart.entity.GroupPurchase;
import com.gathercart.entity.GroupPurchaseStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupPurchaseRepository extends JpaRepository<GroupPurchase, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT gp FROM GroupPurchase gp WHERE gp.id = :id")
    Optional<GroupPurchase> findByIdWithLock(@Param("id") Long id);

    Optional<GroupPurchase> findByBatchCode(String batchCode);

    List<GroupPurchase> findByProductIdAndStatus(Long productId, GroupPurchaseStatus status);

    @Query("SELECT gp FROM GroupPurchase gp WHERE gp.product.id = :productId AND gp.status = 'OPEN' ORDER BY gp.createdAt DESC")
    List<GroupPurchase> findActiveByProductId(@Param("productId") Long productId);

    Page<GroupPurchase> findByStatus(GroupPurchaseStatus status, Pageable pageable);
}
```

Create `GroupParticipantRepository.java`:
```java
package com.gathercart.repository;

import com.gathercart.entity.GroupParticipant;
import com.gathercart.entity.GroupParticipantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupParticipantRepository extends JpaRepository<GroupParticipant, Long> {

    List<GroupParticipant> findByGroupPurchaseIdAndStatusOrderByPledgedAtDesc(Long groupPurchaseId, GroupParticipantStatus status);

    Optional<GroupParticipant> findByGroupPurchaseIdAndUserIdAndStatus(Long groupPurchaseId, Long userId, GroupParticipantStatus status);

    Optional<GroupParticipant> findByGroupPurchaseIdAndPhoneAndStatus(Long groupPurchaseId, String phone, GroupParticipantStatus status);

    @Query("SELECT COALESCE(SUM(gp.quantity), 0) FROM GroupParticipant gp WHERE gp.groupPurchase.id = :groupPurchaseId AND gp.phone = :phone AND gp.status IN ('ACTIVE', 'PAYMENT_PENDING', 'PAID')")
    Integer sumQuantityByGroupPurchaseIdAndPhone(@Param("groupPurchaseId") Long groupPurchaseId, @Param("phone") String phone);

    Optional<GroupParticipant> findByCommitmentCode(String commitmentCode);
}
```

- [ ] **Step 3: Run compiler to verify entities and repositories compile**

Run: `cd backend; mvn compile`
Expected: `BUILD SUCCESS`

- [ ] **Step 4: Commit**

```bash
git add backend/src/main/java/com/gathercart/entity/Group*.java backend/src/main/java/com/gathercart/repository/Group*.java
git commit -m "feat: add GroupPurchase and GroupParticipant entities and repositories"
```

---

### Task 2: Backend DTOs and Data Mapping

**Files:**
- Create: `backend/src/main/java/com/gathercart/dto/GroupPurchaseResponse.java`
- Create: `backend/src/main/java/com/gathercart/dto/GroupParticipantResponse.java`
- Create: `backend/src/main/java/com/gathercart/dto/CreateGroupPurchaseRequest.java`
- Create: `backend/src/main/java/com/gathercart/dto/JoinGroupRequest.java`
- Create: `backend/src/main/java/com/gathercart/dto/UpdatePledgeQuantityRequest.java`

- [ ] **Step 1: Create request and response DTOs**

Create `GroupPurchaseResponse.java`:
```java
package com.gathercart.dto;

import com.gathercart.entity.GroupPurchaseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupPurchaseResponse {
    private Long id;
    private String batchCode;
    private ProductSummaryResponse product;
    private String clusterName;
    private Integer targetQuantity;
    private Integer currentQuantity;
    private Integer remainingQuantity;
    private Integer progressPercent;
    private Integer householdLimit;
    private GroupPurchaseStatus status;
    private LocalDateTime deadline;
    private Integer paymentWindowMins;
    private LocalDateTime paymentDeadline;
    private String leadOrganiser;
    private String hubDropLocation;
    private Boolean isFreeDelivery;
    private String contextMessage;
    private Integer totalParticipants;
    private List<GroupParticipantResponse> recentParticipants;
}
```

Create `GroupParticipantResponse.java`:
```java
package com.gathercart.dto;

import com.gathercart.entity.GroupParticipantStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupParticipantResponse {
    private Long id;
    private String commitmentCode;
    private Long groupPurchaseId;
    private String batchCode;
    private String displayName;
    private String initials;
    private String location;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalAmount;
    private BigDecimal mrpTotal;
    private BigDecimal savings;
    private GroupParticipantStatus status;
    private LocalDateTime pledgedAt;
    private String timeAgo;
    private Boolean isCurrentUser;
}
```

Create `CreateGroupPurchaseRequest.java`:
```java
package com.gathercart.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateGroupPurchaseRequest {
    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Target quantity is required")
    @Min(value = 1, message = "Target quantity must be at least 1")
    private Integer targetQuantity;

    @Min(value = 1, message = "Household limit must be at least 1")
    private Integer householdLimit;

    @NotNull(message = "Closing deadline is required")
    @Future(message = "Deadline must be in the future")
    private LocalDateTime deadline;

    private String clusterName;
    private String leadOrganiser;
    private String hubDropLocation;
}
```

Create `JoinGroupRequest.java`:
```java
package com.gathercart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JoinGroupRequest {
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotBlank(message = "Phone number is required")
    private String phone;

    private String displayName;
    private String location;
    private Long userId;
}
```

Create `UpdatePledgeQuantityRequest.java`:
```java
package com.gathercart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePledgeQuantityRequest {
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
}
```

- [ ] **Step 2: Run compiler to verify DTOs**

Run: `cd backend; mvn compile`
Expected: `BUILD SUCCESS`

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/java/com/gathercart/dto/Group*.java backend/src/main/java/com/gathercart/dto/CreateGroupPurchaseRequest.java backend/src/main/java/com/gathercart/dto/JoinGroupRequest.java backend/src/main/java/com/gathercart/dto/UpdatePledgeQuantityRequest.java
git commit -m "feat: add GroupPurchase and GroupParticipant DTOs"
```

---

### Task 3: Backend Business Service and Transaction Logic

**Files:**
- Create: `backend/src/main/java/com/gathercart/service/GroupPurchaseService.java`
- Create: `backend/src/test/java/com/gathercart/service/GroupPurchaseServiceTest.java`

**Interfaces:**
- Produces:
  - `GroupPurchaseResponse createGroupPurchase(CreateGroupPurchaseRequest request)`
  - `PageResponse<GroupPurchaseResponse> getGroupPurchases(GroupPurchaseStatus status, String filter, Long categoryId, Pageable pageable)`
  - `GroupPurchaseResponse getGroupPurchaseById(Long id)`
  - `GroupPurchaseResponse getActiveGroupByProductId(Long productId)`
  - `GroupParticipantResponse joinGroup(Long groupPurchaseId, JoinGroupRequest request)`
  - `GroupParticipantResponse updateQuantity(Long participantId, int newQuantity)`
  - `void cancelParticipation(Long participantId)`
  - `List<GroupParticipantResponse> getParticipants(Long groupPurchaseId)`

- [ ] **Step 1: Write unit and transactional tests for GroupPurchaseService**

Create `backend/src/test/java/com/gathercart/service/GroupPurchaseServiceTest.java` testing:
- Successful group creation with authoritative calculations.
- Join group increments `currentQuantity` and returns correct savings.
- Rejection when requested quantity exceeds remaining capacity.
- Rejection when requested quantity exceeds household limit.
- Automatic transition to `CONFIRMED` and `paymentDeadline` set when target reached.
- Cancellation decreases `currentQuantity`.

- [ ] **Step 2: Run test to verify it fails initially**

Run: `cd backend; mvn test -Dtest=GroupPurchaseServiceTest`
Expected: FAIL (service not implemented)

- [ ] **Step 3: Implement `GroupPurchaseService`**

Implement business logic with:
- `@Transactional` methods.
- Pessimistic locking using `groupPurchaseRepository.findByIdWithLock(id)`.
- Authoritative calculation from `Product.getGroupPrice()` and `Product.getMrp()`.
- Auto-status transition: if `currentQuantity + qty == targetQuantity`, set `status = CONFIRMED`, `paymentDeadline = now() + paymentWindowMins`, update all participants to `PAYMENT_PENDING`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend; mvn test -Dtest=GroupPurchaseServiceTest`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/gathercart/service/GroupPurchaseService.java backend/src/test/java/com/gathercart/service/GroupPurchaseServiceTest.java
git commit -m "feat: implement GroupPurchaseService with concurrency and business rules"
```

---

### Task 4: Backend REST Controllers and API Integration

**Files:**
- Create: `backend/src/main/java/com/gathercart/controller/GroupPurchaseController.java`
- Create: `backend/src/main/java/com/gathercart/controller/GroupParticipantController.java`
- Create: `backend/src/test/java/com/gathercart/controller/GroupPurchaseControllerTest.java`

- [ ] **Step 1: Write controller test**

Create `GroupPurchaseControllerTest.java` testing:
- `POST /api/v1/group-purchases`: 201 Created.
- `GET /api/v1/group-purchases`: 200 OK.
- `POST /api/v1/group-purchases/{id}/join`: 201 Created.
- `GET /api/v1/group-purchases/{id}/participants`: 200 OK.

- [ ] **Step 2: Implement Controllers**

Implement `GroupPurchaseController` and `GroupParticipantController` mapping all specified endpoints and wrapping responses in `ApiResponse<T>`.

- [ ] **Step 3: Run tests to verify they pass**

Run: `cd backend; mvn test -Dtest=GroupPurchaseControllerTest`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add backend/src/main/java/com/gathercart/controller/Group*.java backend/src/test/java/com/gathercart/controller/GroupPurchaseControllerTest.java
git commit -m "feat: add GroupPurchase and GroupParticipant REST controllers"
```

---

### Task 5: Seed Data for Realistic Groups Matching UI References

**Files:**
- Modify: `backend/src/main/java/com/gathercart/config/DataInitializer.java`

- [ ] **Step 1: Add seed data for active batches matching screens**

Add realistic group purchase batches corresponding to `screen1.png`, `screen3.png`, and `screen5.png`:
1. Sona Masoori Raw Rice: Batch `#IND-409`, Target: 25, Current: 23, Household Limit: 3, Status: `OPEN`, Deadline: in 18h 30m, Participants: Priya M. (2 bags), Karthik R. (1 bag), Anand & Deepa (1 bag).
2. Cold Pressed Groundnut Oil: Batch `#IND-410`, Target: 15, Current: 12, Status: `OPEN`, Deadline: in 55m.
3. Kashmiri Walnuts: Batch `#IND-411`, Target: 12, Current: 9, Status: `OPEN`, Deadline: in 14h.
4. Desi Toor Dal: Batch `#IND-412`, Target: 20, Current: 2, Status: `OPEN`, Deadline: in 2 days.
5. A2 Gir Cow Bilona Ghee: Batch `#IND-398`, Target: 15, Current: 15, Status: `CONFIRMED`, locked & dispatched.
6. Alphonso Mango Pulp: Batch `#IND-380`, Target: 20, Current: 7, Status: `EXPIRED`, target not met.

- [ ] **Step 2: Verify application startup and seed data compilation**

Run: `cd backend; mvn test-compile`
Expected: `BUILD SUCCESS`

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/java/com/gathercart/config/DataInitializer.java
git commit -m "feat: add group-purchase seed data matching reference screens"
```

---

### Task 6: Frontend API Service and Types

**Files:**
- Create: `frontend/src/types/groupPurchase.ts`
- Create: `frontend/src/services/groupPurchaseService.ts`

- [ ] **Step 1: Write TypeScript interfaces**

Create `frontend/src/types/groupPurchase.ts` matching backend DTOs:
- `GroupPurchase`
- `GroupParticipant`
- `CreateGroupPurchaseRequest`
- `JoinGroupRequest`
- `GroupPurchaseQueryParams`

- [ ] **Step 2: Write API service client**

Create `frontend/src/services/groupPurchaseService.ts` calling backend endpoints with typed responses.

- [ ] **Step 3: Verify TypeScript compilation**

Run: `cd frontend; npx tsc --noEmit`
Expected: PASS with 0 errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/types/groupPurchase.ts frontend/src/services/groupPurchaseService.ts
git commit -m "feat: add frontend groupPurchase types and service client"
```

---

### Task 7: Frontend Join Collective Batch Modal (`screen4.png`)

**Files:**
- Create: `frontend/src/components/group/JoinBatchModal.tsx`
- Modify: `frontend/src/components/index.ts`

- [ ] **Step 1: Build `JoinBatchModal`**

Implement component adhering to `screen4.png`:
- Batch Header: "Join Collective Batch #...", "Active Pool", product thumbnail and discount pill.
- Live progress bar with "Batch Progress: X of Y pledged" and "Only Z bags to unlock!".
- Quantity selector with household limit constraint.
- Cost & Community Savings Ledger:
  - Wholesale Pledge Price (`N × unitPrice`)
  - MRP Retail Value (`N × mrp`)
  - Community Hub Bulk Logistics (`₹80 FREE`)
  - Total Due at Milestone Lock (`₹totalAmount`, "You save ₹savings (X%) vs retail")
- Drop-off & Pick-up Location ("Cluster Indiranagar - 560038").
- Confirm button: "Confirm Pledge for N Bags (₹0 Due Now) →" and "Cancel & Return".
- Error alerts and loading spinners on submission.

- [ ] **Step 2: Test build**

Run: `cd frontend; npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/group/JoinBatchModal.tsx frontend/src/components/index.ts
git commit -m "feat: implement JoinBatchModal matching screen 4"
```

---

### Task 8: Frontend Offer Detail Page Integration (`screen3.png`)

**Files:**
- Modify: `frontend/src/pages/OfferDetail/OfferDetailPage.tsx`

- [ ] **Step 1: Connect `OfferDetailPage` to live group purchase data**

- Fetch active group purchase via `groupPurchaseService.getActiveGroupByProductId(id)`.
- Replace hardcoded 23/25 with live batch data (`groupPurchase.currentQuantity`, `groupPurchase.targetQuantity`, `groupPurchase.remainingQuantity`).
- Display live deadline countdown timer.
- Bind quantity selector to `groupPurchase.householdLimit`.
- Connect "Recent neighbours who joined this batch" roster to `groupPurchaseService.getParticipants(groupPurchase.id)`.
- Open `JoinBatchModal` on "Pledge [N] Bags" click.
- On successful pledge confirmation, refresh batch progress and participant roster immediately.

- [ ] **Step 2: Test build**

Run: `cd frontend; npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/OfferDetail/OfferDetailPage.tsx
git commit -m "feat: connect OfferDetailPage to backend group purchase and live participants"
```

---

### Task 9: Frontend Home Page Integration (`screen1.png`)

**Files:**
- Modify: `frontend/src/pages/Home/HomePage.tsx`
- Create: `frontend/src/components/group/ProposeGroupModal.tsx`

- [ ] **Step 1: Connect Home Page offer cards to live group purchases**

- Fetch group purchases with filters (`ending_soon`, `almost_there`).
- Card displays dynamic status pill (`OPEN`, `CONFIRMED`, `OFFER ENDED`).
- Dynamic countdown timer (`ends in 18h 30m`).
- Real progress bar (`X of Y joined`) and context notes ("⚡ Group goal almost reached!").
- Action button dynamically adapts:
  - `OPEN` → "View Offer →"
  - `CONFIRMED` → "View Summary"
  - `OFFER ENDED` → "Offer Closed" (disabled)
- Add "Suggest New Bulk Pool" modal triggered by the bottom banner CTA.

- [ ] **Step 2: Test build**

Run: `cd frontend; npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Home/HomePage.tsx frontend/src/components/group/ProposeGroupModal.tsx
git commit -m "feat: integrate dynamic group purchase batches on Home Page"
```

---

### Task 10: Full-Stack Verification and Concurrency Test

**Files:**
- Create: `backend/src/test/java/com/gathercart/service/GroupPurchaseConcurrencyTest.java`

- [ ] **Step 1: Write multi-threaded concurrency test**

Simulate high concurrent traffic:
- Set up a group purchase with `currentQuantity = 23` and `targetQuantity = 25` (2 slots left).
- Launch 10 parallel threads simultaneously attempting to join with `quantity = 1` each.
- Assert exactly 2 threads succeed and 8 receive business exception / capacity limit error.
- Assert final `currentQuantity == 25` and status is `CONFIRMED`.

- [ ] **Step 2: Run all backend tests**

Run: `cd backend; mvn clean test`
Expected: All tests pass (0 failures).

- [ ] **Step 3: Run full frontend build**

Run: `cd frontend; npm run build`
Expected: PASS with 0 errors.

- [ ] **Step 4: Commit**

```bash
git add backend/src/test/java/com/gathercart/service/GroupPurchaseConcurrencyTest.java
git commit -m "test: add concurrent participation stress test and verify full-stack build"
```
