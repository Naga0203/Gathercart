# Phase 0 Analysis Summary

## Overview
This document summarizes the complete Phase 0 analysis for the **GatherCart** grocery group-buying platform.

---

## 1. Repository Analysis

**Current State**: Brand new project - only documentation and UI screenshots exist
- No frontend code (React + TypeScript + Vite planned)
- No backend code (Java + Spring Boot planned)
- No database configured (MySQL planned)
- Git repository initialized but no commits
- 7 UI reference screenshots in `Screens/` folder

**Stack Discrepancy**: README.md describes Python/Django/Postgres, but Phase 0 prompt specifies Java/Spring Boot/MySQL. **Prompt takes precedence**.

---

## 2. Screen Inventory

**7 Screenshots** (dimensions suggest mobile + desktop views):
| File | Dimensions | Device |
|------|------------|--------|
| screen1.png | 844 × 1600 | Mobile |
| screen2.png | 885 × 1600 | Mobile |
| screen3.png | 691 × 1600 | Mobile (narrow) |
| screen4.png | 1600 × 1207 | Desktop/Tablet |
| screen5.png | 809 × 1600 | Mobile |
| screen6.png | 894 × 1600 | Mobile |
| screen7.png | 770 × 1600 | Mobile |

**⚠️ USER ACTION REQUIRED**: Cannot analyze images automatically. Please describe each screen for accurate analysis.

---

## 3. Feature Inventory

### Core MVP Features
1. **Product Management** - Listing, detail, search, filter, categories
2. **Group Buying** - Create/join groups, progress tracking, deadlines, bulk pricing
3. **Cart Management** - Add/remove/update, price calculation, savings
4. **Authentication** - Register, login, JWT, roles (CUSTOMER/ADMIN)

### Supporting Features
5. **User Profile** - Profile, addresses, order history
6. **Order Management** - Checkout, tracking, history
7. **Notifications** - In-app, deadline reminders

### Admin Features
8. **Admin Dashboard** - Product/Group/Order/User management, analytics

---

## 4. Proposed Architecture

### Frontend (React + TypeScript + Vite)
- Feature-based folder structure (`features/`)
- Shared components (`components/common/`, `components/layout/`)
- Zustand for state, React Query for server state
- Tailwind CSS for styling
- React Router v6 for routing

### Backend (Spring Boot 3.2+)
- Layered architecture: controller → service → repository
- Spring Data JPA + Hibernate
- Spring Security + JWT
- MapStruct for DTO mapping
- Flyway for migrations

### Database (MySQL 8.0)
- 10 core tables with proper relationships
- Soft deletes, optimistic locking, audit fields
- Comprehensive indexing strategy

---

## 5. Database Design

**10 Entities Identified**:
1. `users` - Authentication, roles, profiles
2. `categories` - Hierarchical product categories
3. `products` - Products with regular + group prices
4. `group_purchases` - Group buying campaigns
5. `group_participants` - User participation in groups
6. `carts` - One per user
7. `cart_items` - Items in cart (supports group pricing)
8. `addresses` - User delivery addresses
9. `orders` - Completed orders
10. `order_items` - Line items per order

**Key Constraints**:
- Unique email, one cart per user, one participation per user per group
- Group price ≤ Regular price, min qty ≤ target qty
- CHECK constraints for positive values

---

## 6. API Plan

**REST Endpoints by Domain**:
| Domain | Endpoints |
|--------|-----------|
| Auth | `/api/auth/*` (register, login, refresh, logout, me) |
| Products | `/api/products`, `/api/products/{id}`, `/api/categories` |
| Groups | `/api/groups`, `/api/groups/{id}`, `/join`, `/payment-proof` |
| Cart | `/api/cart`, `/api/cart/items` (CRUD) |
| Addresses | `/api/addresses` (CRUD + set default) |
| Orders | `/api/orders` (create, list, detail) |
| User | `/api/users/me` (profile, password) |
| Admin | `/api/admin/*` (full CRUD + dashboard) |

**Standard Response Format**: Consistent success/error envelopes
**Error Codes**: VALIDATION_ERROR, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, CONFLICT, UNPROCESSABLE_ENTITY, INTERNAL_ERROR

---

## 7. Development Roadmap

**9 Phases over ~9 weeks**:

| Phase | Focus | Duration |
|-------|-------|----------|
| 1 | Project Init & Architecture | Week 1 |
| 2 | UI Foundation & Theme | Week 1-2 |
| 3 | Product Management | Week 2-3 |
| 4 | Group Buying | Week 3-4 |
| 5 | Cart & Pricing | Week 4-5 |
| 6 | Order Management | Week 5-6 |
| 7 | Authentication | Week 6-7 |
| 8 | Additional Features | Week 7-8 |
| 9 | Testing & Stabilization | Week 8-9 |

---

## 8. Risks & Assumptions

### Key Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Group buying concurrency | High | High | Row locking, integration tests |
| JWT security issues | Medium | High | Established library, security review |
| UI/screenshot mismatch | Medium | Medium | Regular design reviews |
| Scope creep | High | Medium | Strict phase gates |

### Assumptions
1. **Screenshots represent final designs** - Need user confirmation
2. **Group price is fixed at creation** - Need clarification
3. **Payment collected on group join** - Need clarification
4. **Single vendor/store model** - Need clarification
5. **Delivery to pincode-based zones** - Need clarification
6. **No real payment gateway in MVP** - Mock/payment proof only

### Missing Information (Need User Input)
1. **Screenshot descriptions** - What each screen shows
2. **Group buying rules** - Min/max qty, deadline duration, price formula
3. **Payment flow** - When collected, payment proof requirements
4. **Delivery model** - Fees, zones, pickup vs delivery
5. **Cancellation policy** - Time windows, penalties
6. **Admin capabilities** - Exact permissions needed

---

## Deliverables Created

| Document | Purpose |
|----------|---------|
| `REPOSITORY_ANALYSIS.md` | Current project state |
| `SCREEN_INVENTORY.md` | Screenshot analysis template |
| `FEATURE_INVENTORY.md` | Categorized features with dependencies |
| `PROPOSED_ARCHITECTURE.md` | Full-stack architecture decisions |
| `DATABASE_DESIGN.md` | 10 entities, relationships, constraints, indexes |
| `API_CONTRACT.md` | Complete REST API specification |
| `DEVELOPMENT_PLAN.md` | 9-phase plan with tasks and milestones |
| `PROJECT_STRUCTURE.md` | Detailed folder structures for frontend/backend |
| `PHASE_0_SUMMARY.md` | This summary |

---

## Next Steps

**Waiting for user approval and clarification on:**

1. ✅ **Describe all 7 screenshots** - Fill in SCREEN_INVENTORY.md
2. ✅ **Clarify group buying business rules** - Min qty, deadline, price calc
3. ✅ **Confirm payment flow** - When payment, proof requirements
4. ✅ **Confirm delivery model** - Fees, zones, fulfillment
5. ✅ **Review and approve** - DATABASE_DESIGN.md, API_CONTRACT.md, DEVELOPMENT_PLAN.md

Once approved, will begin **Phase 1: Project Initialization & Architecture**.