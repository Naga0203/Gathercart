# GatherCart — API Contract

> **Status**: Approved (Phase 0) — Implement starting Phase 1.
>
> **Base URL**: `http://localhost:8080/api/v1`
>
> **Content-Type**: `application/json`

---

## Response Envelope

All API responses use a consistent envelope:

```json
{
  "success": true,
  "data": { },
  "message": "Success",
  "timestamp": "2026-11-09T10:30:00Z"
}
```

Error responses:
```json
{
  "success": false,
  "data": null,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Email is already registered" }
  ],
  "timestamp": "2026-11-09T10:30:00Z"
}
```

Paginated responses wrap `data` in:
```json
{
  "content": [ ],
  "page": 0,
  "size": 12,
  "totalElements": 42,
  "totalPages": 4
}
```

---

## Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (not authenticated) |
| 403 | Forbidden (insufficient role) |
| 404 | Resource Not Found |
| 409 | Conflict (duplicate registration, batch full) |
| 422 | Unprocessable Entity (business rule violation) |
| 500 | Internal Server Error |

---

## 1. Authentication APIs

### POST `/auth/register`
**Purpose**: Register a new user and associate with a cluster.

**Request**:
```json
{
  "fullName": "Ananya Sharma",
  "phone": "+919876543210",
  "email": "ananya.sharma@example.com",
  "password": "securePass123",
  "clusterId": 1,
  "addressLine1": "Flat 402, Lotus Residency",
  "addressLine2": "5th Cross, Indiranagar, Bengaluru – 560038",
  "handoverPreference": "COMMUNITY_PICKUP",
  "preferredPickupNodeId": 1,
  "agreedToTerms": true
}
```

**Validation**:
- `fullName`: required, 2–150 chars
- `phone`: required, valid Indian mobile with country code, unique
- `email`: required, valid email format, unique
- `password`: required, min 8 chars
- `clusterId`: required, must exist
- `addressLine1`: required
- `handoverPreference`: required, one of `COMMUNITY_PICKUP`, `GUARD_DESK`
- `agreedToTerms`: must be `true`

**Response** `201`:
```json
{
  "id": 1,
  "fullName": "Ananya Sharma",
  "email": "ananya.sharma@example.com",
  "phone": "+919876543210",
  "clusterName": "Indiranagar",
  "handoverPreference": "COMMUNITY_PICKUP",
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Errors**: `409` email/phone exists, `400` validation.

---

### POST `/auth/login`
**Purpose**: Authenticate a user.

**Request**:
```json
{
  "email": "ananya.sharma@example.com",
  "password": "securePass123"
}
```

**Response** `200`:
```json
{
  "id": 1,
  "fullName": "Ananya Sharma",
  "email": "ananya.sharma@example.com",
  "role": "CUSTOMER",
  "clusterName": "Indiranagar",
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Errors**: `401` invalid credentials, `403` account deactivated.

---

### POST `/auth/logout`
**Purpose**: Invalidate the current token. 🔒

**Response** `200`: `{ "message": "Logged out successfully" }`

---

### GET `/auth/me`
**Purpose**: Get current authenticated user info. 🔒

**Response** `200`:
```json
{
  "id": 1,
  "fullName": "Ananya Sharma",
  "email": "ananya.sharma@example.com",
  "phone": "+919876543210",
  "role": "CUSTOMER",
  "clusterId": 1,
  "clusterName": "Indiranagar",
  "handoverPreference": "COMMUNITY_PICKUP",
  "penaltyCount": 0,
  "defaultAddress": {
    "addressLine1": "Flat 402, Lotus Residency",
    "addressLine2": "5th Cross, Indiranagar – 560038"
  }
}
```

---

## 2. Cluster APIs

### GET `/clusters/{id}`
**Purpose**: Get cluster details.

**Response** `200`:
```json
{
  "id": 1,
  "name": "Indiranagar",
  "displayName": "Indiranagar Buying Circle #560038",
  "pincode": "560038",
  "city": "Bengaluru",
  "participatingFamilies": 248,
  "totalSavings": 142800.00,
  "nextDeliveryDate": "2026-11-13T16:00:00",
  "pickupNodes": [
    { "id": 1, "name": "Indiranagar Club – Gate 2", "isDefault": true, "deliveryFee": 0.00 }
  ]
}
```

---

### GET `/clusters/{id}/stats`
**Purpose**: Stat banner data.

**Response** `200`:
```json
{
  "participatingFamilies": 248,
  "totalSavingsThisMonth": 142800.00,
  "nextDeliveryDate": "2026-11-13T16:00:00",
  "nextDeliveryLabel": "Thursday 4 PM"
}
```

---

## 3. Category APIs

### GET `/categories`
**Purpose**: List all active categories.

**Response** `200`:
```json
[
  { "id": 1, "name": "Rice & Grains", "icon": "🌾" },
  { "id": 2, "name": "Cold Pressed Oils", "icon": "🫒" },
  { "id": 3, "name": "Pulses & Dals", "icon": "🫘" },
  { "id": 4, "name": "Dry Fruits", "icon": "🥜" }
]
```

---

## 4. Product APIs

### GET `/products`
**Purpose**: List all active products (paginated).

**Query Parameters**: `categoryId`, `search`, `page` (default 0), `size` (default 12).

**Response** `200`:
```json
{
  "content": [
    {
      "id": 1,
      "name": "Sona Masoori Raw Rice",
      "description": "Aged 12 Months • Direct from Raichur Mills",
      "unitLabel": "10 kg bag",
      "mrp": 850.00,
      "groupPrice": 649.00,
      "savingsAmount": 201.00,
      "savingsPercent": 24,
      "imageUrl": "https://...",
      "categoryId": 1,
      "categoryName": "Rice & Grains"
    }
  ],
  "page": 0, "size": 12, "totalElements": 6, "totalPages": 1
}
```

---

### GET `/products/{id}`
**Purpose**: Full product details with co-op profile, quality specs, images.

**Response** `200`:
```json
{
  "id": 1,
  "name": "Sona Masoori Raw Rice (Aged 12 Months)",
  "description": "10 kg Food-Grade Cotton Lined Bag • Direct Mill Sourced",
  "detailedDescription": "This batch is authentic...",
  "unitLabel": "10 kg bag",
  "unitWeightKg": 10.0,
  "mrp": 850.00,
  "groupPrice": 649.00,
  "savingsAmount": 201.00,
  "savingsPercent": 24,
  "imageUrl": "https://...",
  "images": [
    { "id": 1, "imageUrl": "https://...", "isVerified": true }
  ],
  "categoryId": 1,
  "categoryName": "Rice & Grains",
  "isLabVerified": false,
  "isPesticideTested": true,
  "harvestDate": "Nov 2023",
  "moistureLevel": "< 11.8%",
  "grainType": "Medium Raw",
  "processing": "Zero Wax, Single polish",
  "coopProfile": {
    "id": 1,
    "coopIdCode": "KA-RAI-048",
    "name": "Raichur Farmer Producer Co-operative",
    "location": "Tungabhadra Basin, Raichur District, Karnataka",
    "isVerified": true
  }
}
```

---

## 5. Batch / Offer APIs

### GET `/batches`
**Purpose**: List active batches with product info and progress.

**Query Parameters**: `clusterId` (required), `categoryId`, `status` (default OPEN), `filter` (`ending_soon` | `almost_there`), `page`, `size`.

**Response** `200`:
```json
{
  "content": [
    {
      "id": 1,
      "batchCode": "IND-409",
      "product": {
        "id": 1,
        "name": "Sona Masoori Raw Rice",
        "description": "Aged 12 Months • Direct from Raichur Mills",
        "unitLabel": "10 kg bag",
        "mrp": 850.00,
        "groupPrice": 649.00,
        "savingsAmount": 201.00,
        "savingsPercent": 24,
        "imageUrl": "https://..."
      },
      "targetQuantity": 25,
      "currentQuantity": 23,
      "remainingQuantity": 2,
      "progressPercent": 92,
      "householdLimit": 3,
      "status": "OPEN",
      "deadline": "2026-11-10T08:30:00",
      "paymentWindowMins": 10,
      "isFreeDelivery": true,
      "userPledge": {
        "pledgeId": 5,
        "quantity": 2,
        "status": "ACTIVE"
      },
      "contextMessage": "Group goal almost reached! Fast locking"
    }
  ]
}
```

---

### GET `/batches/{id}`
**Purpose**: Full batch details.

**Response** `200`:
```json
{
  "id": 1,
  "batchCode": "IND-409",
  "product": { "..." },
  "cluster": { "id": 1, "name": "Indiranagar" },
  "pickupNode": { "id": 1, "name": "Indiranagar Club – Gate 2", "..." },
  "targetQuantity": 25,
  "currentQuantity": 23,
  "remainingQuantity": 2,
  "progressPercent": 92,
  "householdLimit": 3,
  "status": "OPEN",
  "deadline": "2026-11-10T08:30:00",
  "paymentWindowMins": 10,
  "paymentDeadline": null,
  "totalWeightKg": 250,
  "isFreeDelivery": true,
  "recentParticipants": [
    { "displayName": "Priya M.", "quantity": 2, "location": "6th Main", "joinedAgo": "18m ago" }
  ],
  "totalHouseholds": 14,
  "userPledge": null,
  "leadOrganiser": "Suresh K. (12th Main)"
}
```

---

### GET `/batches/{id}/participants`
**Purpose**: Batch participants for quota pool display. 🔒

**Response** `200`:
```json
[
  { "displayName": "Priya M.", "initials": "PM", "quantity": 2, "isCurrentUser": false },
  { "displayName": "You (An...)", "initials": "A", "quantity": 1, "isCurrentUser": true }
]
```

---

## 6. Pledge APIs

### POST `/pledges`
**Purpose**: Create a pledge (join a batch). 🔒

**Request**:
```json
{
  "batchId": 1,
  "quantity": 2
}
```

**Validation**:
- `batchId`: required, batch must be OPEN, not past deadline
- `quantity`: required, ≥ 1, ≤ `batch.householdLimit`
- Batch must have capacity: `current_quantity + quantity ≤ target_quantity`
- User must not already have a pledge in this batch
- **Phone limit**: Sum of all pledges with same phone in this batch must not exceed `householdLimit`

**Response** `201`:
```json
{
  "id": 5,
  "commitmentCode": "NB-CMT-102-RICE",
  "batchId": 1,
  "batchCode": "IND-409",
  "quantity": 2,
  "unitPrice": 649.00,
  "totalAmount": 1298.00,
  "mrpTotal": 1700.00,
  "savings": 402.00,
  "savingsPercent": 24,
  "status": "ACTIVE",
  "pledgedAt": "2026-11-09T10:30:00",
  "batchAutoConfirmed": false,
  "paymentDeadline": null
}
```

> [!IMPORTANT]
> If this pledge causes `current_quantity == target_quantity`, the batch auto-closes. The response includes `batchAutoConfirmed: true` and `paymentDeadline` set to `NOW() + payment_window_mins`. All pledgers in the batch transition to `PAYMENT_PENDING`.

**Errors**: `409` already pledged / batch full, `422` exceeds household limit / phone limit / batch not open.

---

### PATCH `/pledges/{id}/quantity`
**Purpose**: Modify pledge quantity (increase or decrease). 🔒 Owner only.

**Request**:
```json
{
  "quantity": 3
}
```

**Validation**: Same capacity/limit checks as creation. Only while `pledge.status = ACTIVE` and `batch.status = OPEN`.

**Response** `200`: Updated pledge object (same as POST response format).

**Errors**: `422` batch locked / exceeds limit, `403` not owner.

---

### DELETE `/pledges/{id}`
**Purpose**: Cancel a pledge. 🔒 Owner only.

**Validation**:
- Allowed when pledge is `ACTIVE` (batch OPEN) or `PAYMENT_PENDING` (batch CONFIRMED, before paying)
- If cancelled from `PAYMENT_PENDING`, batch `current_quantity` decreases and batch may revert to `OPEN` if before deadline

**Response** `200`:
```json
{
  "message": "Pledge cancelled successfully",
  "batchReopened": true
}
```

**Errors**: `422` pledge already paid, `403` not owner.

---

## 7. My Orders APIs

### GET `/orders`
**Purpose**: Current user's pledges/orders. 🔒

**Query Parameters**: `status` — `active` | `completed` | `cancelled`

**Response** `200`:
```json
{
  "summary": {
    "lifetimeSavings": 4280.00,
    "batchesCompleted": 6,
    "activeCommitments": 2,
    "collectiveWeightKg": 60
  },
  "pledges": [
    {
      "id": 5,
      "commitmentCode": "NB-CMT-102-GHEE",
      "batch": {
        "batchCode": "IND-398",
        "status": "CONFIRMED",
        "currentQuantity": 15,
        "targetQuantity": 15,
        "progressPercent": 100,
        "paymentDeadline": "2026-11-09T14:10:00"
      },
      "product": {
        "name": "A2 Gir Cow Bilona Ghee (1 L Glass Jar)",
        "imageUrl": "https://...",
        "farmSource": "Saurashtra Organic Dairy Co-op, Rajkot"
      },
      "quantity": 1,
      "totalAmount": 1850.00,
      "mrpTotal": 2400.00,
      "savings": 550.00,
      "status": "PAYMENT_PENDING",
      "pledgedAt": "2026-10-20T18:40:00",
      "paymentDueAt": "2026-11-09T14:10:00",
      "paymentRemainingSeconds": 287,
      "hubPickup": {
        "nodeName": "Indiranagar Club Gate 2",
        "dispatchDate": "Wed, 2:00 PM",
        "hubLead": "Suresh M. (Apt 402)"
      },
      "isActionRequired": true,
      "actionMessage": "Batch Quota Full! Action Required"
    }
  ]
}
```

> [!NOTE]
> `paymentRemainingSeconds` is computed server-side to avoid client clock drift. Frontend renders a live countdown from this value.

---

### GET `/orders/{pledgeId}`
**Purpose**: Detailed order view with lifecycle. 🔒 Owner only.

**Response** `200`:
```json
{
  "pledgeId": 5,
  "commitmentCode": "NB-CMT-102-GHEE",
  "status": "PAYMENT_PENDING",
  "pledgedAt": "2026-10-20T18:40:00",
  "product": { "..." },
  "batch": {
    "batchCode": "IND-398",
    "status": "CONFIRMED",
    "currentQuantity": 15,
    "targetQuantity": 15,
    "paymentDeadline": "2026-11-09T14:10:00",
    "paymentWindowMins": 10
  },
  "quantity": 1,
  "totalAmount": 1850.00,
  "platformFee": 0.00,
  "deliveryFee": 0.00,
  "savings": 550.00,
  "paymentRemainingSeconds": 287,
  "lifecycle": [
    { "step": 1, "title": "Zero-Cost Family Pledge", "status": "COMPLETED", "date": "Oct 20, 06:40 PM" },
    { "step": 2, "title": "Neighbourhood Quota Met", "status": "COMPLETED", "date": "Today, 10:12 AM" },
    { "step": 3, "title": "Direct UPI Settlement", "status": "ACTION_REQUIRED", "dueBy": "10:20 AM", "remainingSeconds": 287 },
    { "step": 4, "title": "Dispatch & Hub Self-Pickup", "status": "PENDING", "estimatedDate": "Wed, Oct 25" }
  ],
  "paymentInfo": {
    "amount": 1850.00,
    "coopVpa": "coop.saurashtra@okhdfcbank",
    "merchantName": "Saurashtra Organic Dairy Co-op",
    "qrCodeUrl": "https://...",
    "paymentDeadline": "2026-11-09T14:10:00"
  },
  "pickupNode": { "..." },
  "coordinator": {
    "name": "Suresh M.",
    "address": "Apartment 402, Oakwood Greens",
    "phone": "+919845011223",
    "role": "Verified Volunteer Cluster Lead"
  },
  "participants": [ "..." ]
}
```

---

## 8. Payment APIs

### POST `/payments`
**Purpose**: Submit UPI payment UTR for verification. 🔒

**Request**:
```json
{
  "pledgeId": 5,
  "utrReference": "429810239410"
}
```

**Validation**:
- `pledgeId`: required, must belong to current user, status must be `PAYMENT_PENDING`
- `utrReference`: required, exactly 12 digits
- Payment window must not have expired

**Response** `200`:
```json
{
  "paymentId": 10,
  "pledgeId": 5,
  "amount": 1850.00,
  "utrReference": "429810239410",
  "status": "VERIFIED",
  "verifiedAt": "2026-11-09T11:00:00",
  "pickupTokenGenerated": true
}
```

**Errors**: `422` pledge not in PAYMENT_PENDING / window expired, `400` invalid UTR format.

---

## 9. Pickup Token APIs

### GET `/pickup-tokens/{pledgeId}`
**Purpose**: Get pickup token for a paid pledge. 🔒 Owner only.

**Response** `200`:
```json
{
  "id": 3,
  "pledgeId": 5,
  "commitmentCode": "NB-CMT-102-GHEE",
  "status": "ACTIVE",
  "qrCodeData": "...",
  "manualPin": "PKP–9842",
  "tamperSealId": "GHEE-8419",
  "pickupWindowStart": "2026-11-09T14:00:00",
  "pickupWindowEnd": "2026-11-09T19:30:00",
  "paymentSummary": {
    "method": "UPI",
    "utrReference": "429810239410",
    "amount": 1850.00,
    "coopName": "Saurashtra Co-op"
  },
  "allocatedItem": {
    "product": { "..." },
    "quantity": 1,
    "bulkPrice": 1850.00,
    "freightFee": 0.00,
    "collectiveSaving": 550.00,
    "totalSettled": 1850.00
  },
  "pickupNode": { "..." },
  "coordinator": { "..." },
  "inspectionProtocol": [
    { "step": 1, "title": "Inspect Glass Jar Seal", "description": "..." },
    { "step": 2, "title": "Confirm Weight & Tag", "description": "..." },
    { "step": 3, "title": "Volunteer Scan Out", "description": "..." }
  ]
}
```

**Errors**: `404` no token yet (payment not verified), `403` not owner.

---

## 10. Admin APIs (MVP — No Admin UI)

### POST `/admin/products` — 🔒 ADMIN
Create a product.

### PUT `/admin/products/{id}` — 🔒 ADMIN
Update a product.

### POST `/admin/batches` — 🔒 ADMIN
Create a new batch/offer.

**Request**:
```json
{
  "productId": 1,
  "clusterId": 1,
  "pickupNodeId": 1,
  "targetQuantity": 25,
  "householdLimit": 3,
  "deadline": "2026-11-15T14:00:00",
  "paymentWindowMins": 10,
  "isFreeDelivery": true
}
```

### PATCH `/admin/batches/{id}/status` — 🔒 ADMIN
Transition batch status (DISPATCHED, DELIVERED, CANCELLED).

### POST `/admin/categories` — 🔒 ADMIN
Create a category.

### POST `/admin/coop-profiles` — 🔒 ADMIN
Create a co-op profile.

---

## 11. System APIs

### GET `/health`
**Purpose**: Health check (no auth).

**Response** `200`:
```json
{ "status": "UP", "timestamp": "2026-11-09T10:30:00Z" }
```

---

## API Summary Table

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/auth/register` | — | Register |
| POST | `/auth/login` | — | Login |
| POST | `/auth/logout` | 🔒 | Logout |
| GET | `/auth/me` | 🔒 | Current user |
| GET | `/clusters/{id}` | — | Cluster info |
| GET | `/clusters/{id}/stats` | — | Cluster stats |
| GET | `/categories` | — | List categories |
| GET | `/products` | — | List products |
| GET | `/products/{id}` | — | Product detail |
| GET | `/batches` | — | List offers |
| GET | `/batches/{id}` | — | Offer detail |
| GET | `/batches/{id}/participants` | 🔒 | Batch participants |
| POST | `/pledges` | 🔒 | Create pledge |
| PATCH | `/pledges/{id}/quantity` | 🔒 | Modify quantity |
| DELETE | `/pledges/{id}` | 🔒 | Cancel pledge |
| GET | `/orders` | 🔒 | My orders |
| GET | `/orders/{pledgeId}` | 🔒 | Order detail |
| POST | `/payments` | 🔒 | Submit payment |
| GET | `/pickup-tokens/{pledgeId}` | 🔒 | Pickup token |
| GET | `/health` | — | Health check |
| POST | `/admin/products` | 🔒 ADMIN | Create product |
| PUT | `/admin/products/{id}` | 🔒 ADMIN | Update product |
| POST | `/admin/batches` | 🔒 ADMIN | Create batch |
| PATCH | `/admin/batches/{id}/status` | 🔒 ADMIN | Update batch status |
| POST | `/admin/categories` | 🔒 ADMIN | Create category |
| POST | `/admin/coop-profiles` | 🔒 ADMIN | Create co-op |
