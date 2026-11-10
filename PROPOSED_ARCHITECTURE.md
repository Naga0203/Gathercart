# Proposed Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │  Pages   │ │Components│ │  Hooks   │ │    Services      │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────┬─────────┘  │
└───────────────────────────────────────────────────│────────────┘
                                                    │ HTTPS/REST
┌───────────────────────────────────────────────────│────────────┐
│                      BACKEND (Spring Boot)        │            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┴────────┐  │
│  │Controlles│ │ Services │ │Repositor.│ │    Security     │  │
│  └──────────┘ └──────────┘ └──────────┘ └─────────────────┘  │
│                                                     │          │
└─────────────────────────────────────────────────────│──────────┘
                                                      │ JDBC
┌─────────────────────────────────────────────────────│──────────┐
│                    DATABASE (MySQL)                 │          │
│  ┌────────────────────────────────────────────────┘          │
│  │  Tables: users, products, categories, groups,            │
│  │  participants, carts, cart_items, orders, addresses      │
│  └──────────────────────────────────────────────────────────┘
└───────────────────────────────────────────────────────────────┘
```

## Frontend Architecture (React + TypeScript + Vite)

### Folder Structure
```
src/
├── assets/              # Static assets (images, fonts)
├── components/          # Shared UI components
│   ├── common/          # Buttons, Inputs, Modals, Cards, etc.
│   ├── layout/          # Header, Footer, Sidebar, Layouts
│   └── forms/           # Form-specific components
├── config/              # App configuration, constants
├── features/            # Feature-based modules
│   ├── auth/            # Login, Register, Auth context
│   ├── products/        # Product listing, details, search
│   ├── groups/          # Group buying features
│   ├── cart/            # Cart management
│   ├── orders/          # Order history, tracking
│   ├── profile/         # User profile, addresses
│   └── admin/           # Admin features
├── hooks/               # Custom React hooks
├── layouts/             # Page layouts (AuthLayout, MainLayout, AdminLayout)
├── pages/               # Route-level page components
├── services/            # API clients, axios instance
├── store/               # State management (Zustand/Context)
├── types/               # TypeScript interfaces/types
├── utils/               # Utility functions
├── validation/          # Form validation schemas (Zod)
├── App.tsx              # Root component
├── main.tsx             # Entry point
└── vite-env.d.ts        # Vite type declarations
```

### Key Architectural Decisions

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| State Management | Zustand + React Context | Lightweight, TypeScript-friendly |
| API Client | Axios with interceptors | Request/response handling, auth tokens |
| Forms | React Hook Form + Zod | Performance, validation |
| Routing | React Router v6 | Standard, nested routes |
| Styling | Tailwind CSS | Utility-first, design system |
| Icons | Lucide React | Consistent, tree-shakeable |
| Theme | CSS Variables + Context | No flash, system detection |

---

## Backend Architecture (Spring Boot)

### Package Structure
```
com.gathercart
├── config/                  # Configuration classes
│   ├── SecurityConfig.java
│   ├── CorsConfig.java
│   ├── JwtConfig.java
│   ├── DatabaseConfig.java
│   └── OpenApiConfig.java
├── controller/              # REST Controllers
│   ├── AuthController.java
│   ├── ProductController.java
│   ├── GroupController.java
│   ├── CartController.java
│   ├── OrderController.java
│   ├── UserController.java
│   └── AdminController.java
├── dto/                     # Data Transfer Objects
│   ├── request/
│   ├── response/
│   └── mapper/
├── entity/                  # JPA Entities
│   ├── User.java
│   ├── Product.java
│   ├── Category.java
│   ├── GroupPurchase.java
│   ├── GroupParticipant.java
│   ├── Cart.java
│   ├── CartItem.java
│   ├── Order.java
│   ├── OrderItem.java
│   └── Address.java
├── exception/               # Exception handling
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   ├── BusinessRuleException.java
│   └── ErrorResponse.java
├── mapper/                  # Entity-DTO mappers (MapStruct)
├── repository/              # Spring Data JPA Repositories
├── security/                # Security components
│   ├── JwtFilter.java
│   ├── JwtUtil.java
│   ├── UserDetailsServiceImpl.java
│   └── CustomAccessDeniedHandler.java
├── service/                 # Business Logic
│   ├── ProductService.java
│   ├── GroupService.java
│   ├── CartService.java
│   ├── OrderService.java
│   ├── UserService.java
│   └── AuthService.java
├── validation/              # Custom validators
└── GatherCartApplication.java
```

### Key Architectural Decisions

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Build Tool | Maven | Standard, enterprise-ready |
| ORM | Spring Data JPA + Hibernate | Productivity, type-safe queries |
| Validation | Bean Validation (Jakarta) | Declarative, standard |
| Mapping | MapStruct | Compile-time, performant |
| Security | Spring Security + JWT | Stateless, scalable |
| API Docs | SpringDoc OpenAPI | Auto-generated, Swagger UI |
| Transactions | @Transactional | Declarative, AOP-based |
| Logging | SLF4J + Logback | Standard, configurable |

---

## Database Architecture (MySQL)

### Naming Conventions
| Element | Convention | Example |
|---------|------------|---------|
| Tables | snake_case, plural | `group_purchases` |
| Columns | snake_case | `created_at` |
| Primary Keys | `id` (BIGINT, AUTO_INCREMENT) | `id` |
| Foreign Keys | `{table}_id` | `user_id` |
| Indexes | `idx_{table}_{column(s)}` | `idx_products_category_id` |
| Unique Constraints | `uk_{table}_{column(s)}` | `uk_users_email` |

### Key Design Principles
1. **Soft deletes** - Use `deleted_at` timestamp instead of hard deletes
2. **Audit fields** - `created_at`, `updated_at` on all entities
3. **Optimistic locking** - `version` column for concurrent updates
4. **UUIDs for public IDs** - Internal BIGINT PK, public UUID for APIs
5. **Enum storage** - VARCHAR for status enums (readable, flexible)

---

## API Design Principles

### REST Conventions
| Resource | Endpoints |
|----------|-----------|
| Products | `GET /api/products`, `GET /api/products/{id}`, `POST /api/products` (admin) |
| Groups | `GET /api/groups`, `POST /api/groups`, `GET /api/groups/{id}`, `POST /api/groups/{id}/join` |
| Cart | `GET /api/cart`, `POST /api/cart/items`, `PATCH /api/cart/items/{id}`, `DELETE /api/cart/items/{id}` |
| Orders | `GET /api/orders`, `POST /api/orders`, `GET /api/orders/{id}` |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |

### Response Format
```json
// Success
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "size": 20, "total": 100 }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [{ "field": "email", "message": "Invalid email format" }]
  }
}
```

### HTTP Status Codes
- `200` - OK
- `201` - Created
- `204` - No Content
- `400` - Bad Request (validation)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (business rule)
- `422` - Unprocessable Entity
- `500` - Internal Server Error

---

## Security Architecture

### Authentication Flow
```
1. User registers → POST /api/auth/register → Returns user + tokens
2. User logs in → POST /api/auth/login → Returns access + refresh tokens
3. Client stores tokens in HttpOnly cookies (preferred) or secure storage
4. Each request → Access token in Authorization header
5. Token expiry → Refresh token to get new access token
6. Logout → Invalidate refresh token
```

### Authorization Matrix
| Resource | CUSTOMER | ADMIN |
|----------|----------|-------|
| Products (read) | ✅ | ✅ |
| Products (write) | ❌ | ✅ |
| Groups (create/join) | ✅ | ✅ |
| Groups (manage all) | ❌ | ✅ |
| Cart (own) | ✅ | ✅ |
| Cart (others) | ❌ | ✅ |
| Orders (own) | ✅ | ✅ |
| Orders (all) | ❌ | ✅ |
| Users (self) | ✅ | ✅ |
| Users (all) | ❌ | ✅ |

---

## Deployment Architecture (Future)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│  Nginx/     │────▶│  Spring Boot│
│  (Static)   │     │  CloudFront │     │  (API)      │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                    ┌──────────┴──────────┐
                                    ▼                     ▼
                              ┌──────────┐           ┌──────────┐
                              │  MySQL   │           │  Redis   │
                              │ (Primary)│           │ (Cache)  │
                              └──────────┘           └──────────┘
```

---

## Cross-Cutting Concerns

| Concern | Frontend | Backend |
|---------|----------|---------|
| Error Handling | Error boundaries, toast notifications | GlobalExceptionHandler, ProblemDetail |
| Logging | Console (dev), Sentry (prod) | SLF4J, structured JSON logs |
| Validation | Zod schemas (client-side) | Bean Validation (server-side) |
| Caching | React Query / SWR | Redis (future), @Cacheable |
| Rate Limiting | N/A | Bucket4j / Spring Cloud Gateway |
| Monitoring | Web Vitals | Micrometer + Prometheus |
| Testing | Vitest + React Testing Library | JUnit 5 + Mockito + Testcontainers |