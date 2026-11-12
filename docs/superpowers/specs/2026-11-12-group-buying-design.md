# GatherCart — Phase 4: Group Buying and Group Participation Design Specification

- **Date**: 2026-11-12
- **Author**: Antigravity Senior Full-Stack Engineer
- **Status**: Approved Design Specification
- **Phase**: 4 (Group Buying and Group Participation)

---

## 1. Executive Summary

GatherCart ("NeighbourBuy") enables community neighbours within residential clusters to pool purchasing power to unlock wholesale pricing directly from regional farmer cooperatives and mills. 

In **Phase 4**, we implement the complete transactional group-buying flow end-to-end:
1. **Group Purchase Pool Lifecycle**: Management of group buying batches scoped to products and clusters with target quotas and closing deadlines.
2. **Participation & Pledge Transactions**: Safe, concurrent user joining with ₹0 upfront payment, strict household limits, and atomic quota deduction.
3. **Pessimistic Concurrency Protection**: Zero over-subscription past target quantities under concurrent traffic.
4. **Authoritative Calculation & Status Automation**: Backend as the single source of truth for pricing, savings, progress percentage, and automatic status transitions (`OPEN` → `CONFIRMED` / `EXPIRED`).
5. **Interactive UI Matching Reference Screens**: Implementation of the dynamic group offer grid (`screen1.png`), offer details with batch quota tracking (`screen3.png`), and the Join Collective Batch modal with the savings ledger (`screen4.png`).

---

## 2. Business Rules & Domain Logic

| Rule | Specification |
|---|---|
| **Group Creation** | Admins / Coordinators launch group purchases for catalog products specifying target quota, closing deadline, household limit, and pickup hub. |
| **Minimum Quota Requirement** | Each group purchase has a fixed `targetQuantity` (e.g. 25 bags) required to unlock direct mill wholesale pricing. |
| **Participation / Pledging** | Users reserve 1 to `householdLimit` units (default max 3) at ₹0 upfront payment. |
| **Household Limit Enforcement** | Enforced per phone number and per user account: `SUM(active quantity) <= householdLimit`. |
| **One Pledge per User per Group** | A user can only hold one active pledge per group purchase; additional actions modify the existing pledge quantity or cancel it. |
| **Authoritative Pricing** | Unit group price is taken directly from `Product.groupPrice`. `mrpTotal = Product.mrp * quantity`, `totalAmount = Product.groupPrice * quantity`, `savings = mrpTotal - totalAmount`. No client-side price trust. |
| **Auto-Lock Transition** | When `currentQuantity == targetQuantity`, the group purchase status automatically transitions from `OPEN` to `CONFIRMED`. `paymentDeadline` is set to `now() + paymentWindowMins` (default 10 mins). All active participants transition to `PAYMENT_PENDING`. |
| **Deadline Expiration** | If the closing deadline passes and `currentQuantity < targetQuantity`, status transitions to `EXPIRED`. No charges or penalties are applied. |
| **Cancellation & Re-opening** | A user may cancel their active pledge while the group is `OPEN`, or before paying in `PAYMENT_PENDING`. If cancelled from `CONFIRMED`, `currentQuantity` drops below target, causing the group to revert to `OPEN` if the closing deadline has not passed. |
| **Fulfillment Linkage** | Group purchase is linked to a cluster pickup hub (e.g., Indiranagar Club - Gate 2) and lead coordinator. |

---

## 3. Database Schema & Entities

### 3.1 `GroupPurchase` Entity (Table: `group_purchase`)
```sql
CREATE TABLE group_purchase (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    batch_code              VARCHAR(50) NOT NULL UNIQUE,
    product_id              BIGINT NOT NULL,
    cluster_id              BIGINT NULL,
    pickup_node_id          BIGINT NULL,
    target_quantity         INT NOT NULL,
    current_quantity        INT NOT NULL DEFAULT 0,
    household_limit         INT NOT NULL DEFAULT 3,
    status                  VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    deadline                DATETIME NOT NULL,
    payment_window_mins     INT NOT NULL DEFAULT 10,
    payment_deadline        DATETIME NULL,
    lead_organiser          VARCHAR(150) NULL,
    hub_drop_location       VARCHAR(255) NULL,
    is_free_delivery        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at              DATETIME NOT NULL,
    updated_at              DATETIME NOT NULL,
    CONSTRAINT fk_group_purchase_product FOREIGN KEY (product_id) REFERENCES product(id),
    CONSTRAINT chk_group_purchase_quantity CHECK (current_quantity <= target_quantity),
    CONSTRAINT chk_group_purchase_positive CHECK (target_quantity > 0 AND household_limit > 0)
);

CREATE INDEX idx_group_purchase_product ON group_purchase(product_id);
CREATE INDEX idx_group_purchase_status ON group_purchase(status);
CREATE INDEX idx_group_purchase_deadline ON group_purchase(deadline);
```

### 3.2 `GroupParticipant` Entity (Table: `group_participant`)
```sql
CREATE TABLE group_participant (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    commitment_code         VARCHAR(50) NOT NULL UNIQUE,
    group_purchase_id       BIGINT NOT NULL,
    user_id                 BIGINT NULL,
    display_name            VARCHAR(100) NOT NULL,
    phone                   VARCHAR(20) NOT NULL,
    location                VARCHAR(100) NULL,
    quantity                INT NOT NULL,
    unit_price              DECIMAL(10, 2) NOT NULL,
    total_amount            DECIMAL(10, 2) NOT NULL,
    mrp_total               DECIMAL(10, 2) NOT NULL,
    savings                 DECIMAL(10, 2) NOT NULL,
    status                  VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    pledged_at              DATETIME NOT NULL,
    payment_due_at          DATETIME NULL,
    paid_at                 DATETIME NULL,
    cancelled_at            DATETIME NULL,
    created_at              DATETIME NOT NULL,
    updated_at              DATETIME NOT NULL,
    CONSTRAINT fk_participant_group_purchase FOREIGN KEY (group_purchase_id) REFERENCES group_purchase(id),
    CONSTRAINT uk_participant_group_user UNIQUE (group_purchase_id, user_id),
    CONSTRAINT chk_participant_quantity CHECK (quantity > 0)
);

CREATE INDEX idx_participant_group ON group_participant(group_purchase_id);
CREATE INDEX idx_participant_phone ON group_participant(group_purchase_id, phone);
CREATE INDEX idx_participant_status ON group_participant(status);
```

---

## 4. Backend Architecture & Concurrency Control

### 4.1 Concurrency & Pessimistic Locking
To prevent race conditions when multiple users simultaneously attempt to join a group near full capacity:
```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT gp FROM GroupPurchase gp WHERE gp.id = :id")
Optional<GroupPurchase> findByIdWithLock(@Param("id") Long id);
```
During `joinGroup`, `modifyQuantity`, and `cancelParticipation`:
1. Open `@Transactional` boundary.
2. Acquire exclusive write lock on `GroupPurchase` row via `findByIdWithLock(id)`.
3. Check status is `OPEN` and `LocalDateTime.now().isBefore(deadline)`.
4. Validate phone/user household limit: `existingQuantity + newQuantity <= householdLimit`.
5. Validate capacity: `currentQuantity + addedQuantity <= targetQuantity`.
6. Insert / update `GroupParticipant` and update `groupPurchase.currentQuantity`.
7. If `currentQuantity == targetQuantity`:
   - Set `groupPurchase.status = CONFIRMED`.
   - Set `groupPurchase.paymentDeadline = LocalDateTime.now().plusMinutes(paymentWindowMins)`.
   - Update all active group participants to `PAYMENT_PENDING`.
8. Commit transaction (releasing lock).

### 4.2 REST APIs
- `GET /api/v1/group-purchases`: Paginated list with filtering by `status`, `categoryId`, and quick filters (`ending_soon`, `almost_there`).
- `GET /api/v1/group-purchases/{id}`: Detailed information including progress, countdown, and organizer details.
- `GET /api/v1/group-purchases/by-product/{productId}`: Active group purchase for a specific product.
- `POST /api/v1/group-purchases`: Create a new group purchase.
- `POST /api/v1/group-purchases/{id}/join`: Join an open group purchase with quantity, phone, and name.
- `GET /api/v1/group-purchases/{id}/participants`: List recent participants with masked display names for community trust roster.
- `PATCH /api/v1/group-participants/{id}/quantity`: Modify participation quantity.
- `DELETE /api/v1/group-participants/{id}`: Cancel participation and release quota.

---

## 5. Frontend Architecture & Screen Implementation

### 5.1 Updated Pages & Components
1. **`HomePage.tsx` (`screen1.png`)**:
   - Offer cards connected to real group purchase data.
   - Live status badges: `OPEN`, `CONFIRMED`, `OFFER ENDED`.
   - Dynamic progress indicators (`X of Y joined`, progress bar, contextual tags).
   - Filter chips: `All Offers`, `Ending soon (<24h)`, `Almost there (<=5 units needed)`.
   - "Suggest New Bulk Pool" modal to create/propose group purchases.
2. **`OfferDetailPage.tsx` (`screen3.png`)**:
   - Connected to `GET /api/v1/group-purchases/by-product/:id`.
   - Shows live batch progress, closing deadline countdown, remaining bags needed.
   - Household limit counter and live pricing calculations.
   - Recent neighbours roster loaded from `/participants`.
   - "Pledge [N] Bags" button triggers `JoinBatchModal`.
3. **`JoinBatchModal.tsx` (`screen4.png`)**:
   - Modal popup displaying batch code, quota target, live progress bar.
   - Quantity selector bounded by remaining quota and household limit.
   - Cost & Community Savings Ledger (Wholesale price, MRP value, Community hub bulk logistics: ₹80 FREE, Total Due at Milestone Lock).
   - Drop-off & pick-up location info.
   - "Confirm Pledge (₹0 Due Now)" button submitting to backend API.

### 5.2 Frontend Services & Types
- Types: `GroupPurchase`, `GroupParticipant`, `CreateGroupPurchaseRequest`, `JoinGroupRequest`.
- API Service: `groupPurchaseService.ts` encapsulating all HTTP calls via the centralized Axios client.

---

## 6. Verification & Testing Strategy

1. **Unit & Integration Tests (Backend)**:
   - `GroupPurchaseServiceTest`: Test group creation, querying, progress calculations.
   - Transactional participation: Verify atomic `currentQuantity` increment, rejection when exceeding `targetQuantity`, rejection when exceeding `householdLimit`.
   - Auto-confirmation: Test that adding the final pledge transitions `GroupPurchase` to `CONFIRMED` and sets `paymentDeadline`.
   - Cancellation: Test quota release and re-opening from `CONFIRMED` to `OPEN`.
   - Multi-threaded Concurrency Test: Simulate 10 concurrent threads attempting to pledge 1 unit each when only 2 units remain; assert exactly 2 succeed and 8 fail cleanly without overselling.
2. **End-to-End Verification (Frontend & Backend)**:
   - Browse offers on Home Page with live progress from MySQL/PostgreSQL.
   - Filter by "Almost there" and "Ending soon".
   - Open Offer Detail, view dynamic quota and participants.
   - Complete join pledge in `JoinBatchModal` and verify immediate database update and UI reflection.
