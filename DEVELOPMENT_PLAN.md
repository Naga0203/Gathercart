# GatherCart — Development Plan

> **Status**: Proposed (Phase 0) — Awaiting approval before execution.

---

## Project Overview

**GatherCart** (branded "NeighbourBuy" in the UI) is a neighbourhood group-buying grocery platform for India. Users in the same residential cluster collectively pledge to buy bulk quantities of staple groceries (rice, oils, ghee, dals, dry fruits) directly from farmer cooperatives at wholesale prices. Payment is collected only after the group target is met, and items are delivered to a community hub for self-pickup.

---

## Development Phases

### Phase 1: Full-Stack Project Initialization
**Goal**: Scaffold both projects, configure Supabase PostgreSQL with Spring Data JPA, establish architecture layers, and verify communication.

| Task | Details | Status |
|------|---------|--------|
| Initialize React + Vite + TypeScript project | Under `frontend/` (standardized folders: components, layouts, pages, features, hooks, services, types, utils, config) | ✅ Complete |
| Install frontend dependencies | Tailwind CSS, React Router, Axios, Lucide React | ✅ Complete |
| Initialize Spring Boot project (Maven) | Under `backend/`, Java 21, Spring Boot 3.3.x | ✅ Complete |
| Add backend dependencies | Spring Web, Spring Data JPA, PostgreSQL Driver, Lombok, Validation, Dotenv | ✅ Complete |
| Establish layered backend architecture | config, controller, service, repository, entity, dto, exception, mapper, validation | ✅ Complete |
| Configure Supabase connection | `application.yml` and `.env` with environment variables & HikariCP | ✅ Complete |
| Implement global exception handler | Consistent ApiResponse envelope with validation handling | ✅ Complete |
| Configure CORS | Allow `http://localhost:5173` | ✅ Complete |
| Create API health endpoint | `GET /api/v1/health` with Supabase live verification | ✅ Complete |
| Create Axios API client | Centralized with request/response interceptors & token prep | ✅ Complete |
| Verify frontend ↔ backend communication | Health check API call verified | ✅ Complete |
| Update project documentation | README.md, DEVELOPMENT_PLAN.md, DATABASE_DESIGN.md, API_CONTRACT.md | ✅ Complete |

**Completion Criteria**: Both applications start; Spring Boot connects to Supabase PostgreSQL; frontend communicates with backend health endpoint successfully. (Status: ✅ Complete)

---

### Phase 2: UI Foundation, Shell & Theme
**Goal**: Build the reusable component library, app shell, routing, and theme system.

| Task | Details | Status |
|------|---------|--------|
| Extract design tokens from screenshots | Colors, fonts, spacing, radii, shadows | ✅ Complete |
| Configure Tailwind theme & CSS variables | Brand palette, CSS variables in `index.css` | ✅ Complete |
| Build Header component | Logo, location selector, nav links, user menu, mobile drawer | ✅ Complete |
| Build Footer component | Trust badges, contact info, copyright | ✅ Complete |
| Build ClusterStatTicker | Families, savings, next delivery | ✅ Complete |
| Build TrustBadgesRow | 3 signature trust cards | ✅ Complete |
| Build MainLayout | Header + ticker + content + trust badges + footer | ✅ Complete |
| Configure React Router routes | All 7 screens configured and rendered | ✅ Complete |
| Build all shared components | Button, Badge, ProgressBar, CountdownTimer, PriceDisplay, QuantitySelector, Modal, Input, Breadcrumb, Card | ✅ Complete |
| Implement 3-mode theme system | Light / Dark / System Default with OS listener and localStorage persistence | ✅ Complete |
| Implement responsive design | Desktop, tablet, and mobile layouts | ✅ Complete |

**Completion Criteria**: Shell matches screenshots; navigation works; theme toggles correctly; TypeScript clean build. (Status: ✅ Complete)

---

### Phase 3: Products, Categories & Offer Browsing
**Goal**: End-to-end product/offer listing with backend data.

| Task | Details |
|------|---------|
| Create DB entities | `category`, `coop_profile`, `product`, `product_image` |
| Implement Product CRUD APIs | GET list (paginated), GET by ID, admin POST/PUT |
| Implement Category API | GET all categories |
| Implement Home page | Hero section, category filter, offer card grid |
| Implement Product Detail page | Gallery, specs, co-op profile, quality notes |
| Add seed data | Categories, co-op profiles, 6 products with images |
| Integration | Connect frontend to real APIs |
| Test | Product listing, detail, category filter, search |

**Completion Criteria**: User can browse products loaded from MySQL.

---

### Phase 4: Batches, Pledges & Group Buying
**Goal**: Core group-buying flow — batch progress, pledge creation, modification, cancellation.

| Task | Details |
|------|---------|
| Create DB entities | `batch`, `pledge` |
| Implement Batch APIs | GET list (with filters), GET detail, GET participants |
| Implement Pledge APIs | POST create, PATCH modify quantity, DELETE cancel |
| Implement concurrency protection | Pessimistic locking on batch row during pledge |
| Implement batch progress computation | current/target, remaining, percentage |
| Build offer cards with batch data | Status, countdown, progress bar, participant count |
| Build JoinBatchModal | Quantity selector, savings ledger, confirm/cancel |
| Build pledge actions | View/Modify, Cancel, Share to WhatsApp |
| Implement household limit enforcement | Backend validation |
| Implement batch status transitions | OPEN → CONFIRMED/EXPIRED |
| Add seed data | Batches in various states |
| Test | Create/modify/cancel pledge, concurrent pledges, capacity overflow |

**Completion Criteria**: Full group-buying workflow works through React → Spring Boot → MySQL.

---

### Phase 5: My Orders & Order Detail
**Goal**: User's order dashboard and order lifecycle view.

| Task | Details |
|------|---------|
| Implement Orders APIs | GET my orders (with tab filters), GET order detail with lifecycle |
| Build My Orders page | Summary stats, 3 tabs, pledge cards, activity history |
| Build Order Detail page | Lifecycle stepper, allocated item, coordinator, quota pool |
| Implement order lifecycle computation | 4-step status derivation from pledge/batch/payment state |
| Implement action badges | "Action Required", countdowns |
| Test | Orders in all states, lifecycle correctness |

**Completion Criteria**: Users can view their pledges/orders with correct lifecycle status.

---

### Phase 6: Payments & Pickup Tokens
**Goal**: UPI payment submission, verification, and pickup token generation.

| Task | Details |
|------|---------|
| Create DB entities | `payment`, `pickup_token` |
| Implement Payment API | POST submit UTR |
| Implement Pickup Token API | GET token (generated after payment verification) |
| Build Payment panel | Amount display, QR code, VPA copy, UTR input, verify button |
| Build Pickup Token page | QR pass, PIN, item allocation, pickup node, map, coordinator, inspection protocol |
| Implement token generation | QR data + random PIN on payment verification |
| Test | Payment flow, token generation, edge cases |

**Completion Criteria**: Full flow: pledge → batch locks → pay → get pickup token.

---

### Phase 7: Authentication & Authorization
**Goal**: JWT-based auth with Spring Security; protect all user-owned resources.

| Task | Details |
|------|---------|
| Create DB entity | `user`, `user_address` |
| Implement Auth APIs | Register, Login, Logout, /me |
| Configure Spring Security | JWT filter, BCrypt passwords, role-based access |
| Build Registration page | Full form matching Screen 2 |
| Build Login page | Email + password |
| Implement AuthProvider | React context, token storage, protected routes |
| Retrofit ownership | Pledges, orders, payments, tokens scoped to authenticated user |
| Remove hardcoded user IDs | Replace with `@CurrentUser` |
| Test | Register, login, unauthorized access, cross-user isolation |

**Completion Criteria**: All resources are user-scoped; no anonymous access to protected endpoints.

> [!NOTE]
> Auth is Phase 7 (not Phase 1) to allow faster iteration on core business logic. During Phases 3–6, a temporary hardcoded user ID will be used. Phase 7 retrofits real auth into all features.

---

### Phase 8: Polish & Additional Features
**Goal**: Remaining MVP features, UI polish, edge cases.

| Task | Details |
|------|---------|
| Cluster management seed | Default cluster with pickup nodes |
| "How It Works" static page | Process explanation |
| "Suggest New Bulk Pool" form | Simple user request |
| FAQ section on registration page | Static content |
| Share to WhatsApp deep links | `wa.me` URL construction |
| Address management | User can edit delivery address |
| Upcoming cluster run preview | "Notify Me" CTA on pickup token page |
| Responsive polish | Mobile nav, card layouts, modal sizing |
| Empty states | All pages with no data |
| Error handling polish | Network errors, 500s, timeouts |

---

### Phase 9: Integration Testing & Stabilization
**Goal**: Full-stack verification, security audit, performance review.

| Task | Details |
|------|---------|
| End-to-end workflow testing | Browse → Detail → Pledge → Orders → Pay → Pickup |
| Cross-user isolation testing | Verify data ownership |
| Theme testing | Light, dark, system in all pages |
| Responsive testing | Desktop, tablet, mobile |
| Security audit | CORS, JWT, input validation, SQL injection |
| Performance review | N+1 queries, unnecessary re-renders |
| Documentation update | All .md files reflect final state |

---

## Feature Dependency Order

```mermaid
flowchart LR
    P1["Phase 1: Scaffolding"] --> P2["Phase 2: UI Shell"]
    P2 --> P3["Phase 3: Products"]
    P3 --> P4["Phase 4: Batches & Pledges"]
    P4 --> P5["Phase 5: Orders"]
    P5 --> P6["Phase 6: Payments & Tokens"]
    P6 --> P7["Phase 7: Auth"]
    P7 --> P8["Phase 8: Polish"]
    P8 --> P9["Phase 9: Testing"]
```

Each phase depends on the one before it. Phases cannot be reordered except:
- Phase 7 (Auth) could theoretically be Phase 3, but delaying it speeds up early iteration.

---

## Estimated Effort

| Phase | Effort Estimate |
|-------|----------------|
| Phase 1 | Small — scaffolding |
| Phase 2 | Medium — many components |
| Phase 3 | Medium — first E2E feature |
| Phase 4 | Large — core business logic + concurrency |
| Phase 5 | Medium — read-heavy dashboard |
| Phase 6 | Medium — payment + token generation |
| Phase 7 | Large — security across all features |
| Phase 8 | Medium — polish + extras |
| Phase 9 | Medium — testing + fixes |

---

## Confirmed Business Rules (Resolved)

All open questions have been answered. These rules govern Phase 4+ implementation:

| # | Question | Answer |
|---|----------|--------|
| 1 | **Batch auto-close** | ✅ Auto-close when `current_quantity == target_quantity` — no admin confirmation needed |
| 2 | **Payment window** | ✅ **5–10 minutes** after batch confirmation (very short — real-time urgency) |
| 3 | **Failed payment** | ✅ **Auto-release** the spot if payment fails. **Penalty** if user waited > 8 minutes before failing (wastes other participants' time) |
| 4 | **Household limit scope** | ✅ Per **phone number** (not per user account or address) |
| 5 | **Pledge modification** | ✅ Users **can increase or decrease** quantity after pledging (while batch is OPEN and capacity allows) |
| 6 | **Cancel after confirmed** | ✅ Users **can cancel** even after batch is confirmed but before paying |
| 7 | **Multiple pledges** | ✅ **One pledge per user per batch** (modify existing pledge, don't create a second)  |

> [!IMPORTANT]
> The 5–10 minute payment window is a critical UX constraint. The frontend must show a live countdown timer and the backend must enforce expiry with automatic spot release. A scheduled task or database-level TTL check is required to release unpaid pledges after the window expires.
