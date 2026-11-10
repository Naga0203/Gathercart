# Project Structure

## Repository Layout

```
GatherCart/
├── .github/
│   └── workflows/           # CI/CD pipelines
├── backend/                 # Spring Boot application
├── frontend/                # React + Vite application
├── docs/                    # Documentation
│   ├── architecture/
│   ├── api/
│   └── database/
├── screens/                 # UI reference screenshots (existing)
├── docker-compose.yml       # Local development stack
├── README.md
├── DEVELOPMENT_PLAN.md
├── DATABASE_DESIGN.md
├── API_CONTRACT.md
├── PROJECT_STRUCTURE.md
└── REPOSITORY_ANALYSIS.md
```

---

## Backend Structure (Spring Boot)

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── gathercart/
│   │   │           ├── GatherCartApplication.java
│   │   │           ├── config/
│   │   │           │   ├── SecurityConfig.java
│   │   │           │   ├── CorsConfig.java
│   │   │           │   ├── JwtConfig.java
│   │   │           │   ├── DatabaseConfig.java
│   │   │           │   ├── OpenApiConfig.java
│   │   │           │   ├── MapStructConfig.java
│   │   │           │   └── AsyncConfig.java
│   │   │           ├── controller/
│   │   │           │   ├── AuthController.java
│   │   │           │   ├── ProductController.java
│   │   │           │   ├── CategoryController.java
│   │   │           │   ├── GroupController.java
│   │   │           │   ├── CartController.java
│   │   │           │   ├── OrderController.java
│   │   │           │   ├── AddressController.java
│   │   │           │   ├── UserController.java
│   │   │           │   └── admin/
│   │   │           │       ├── AdminProductController.java
│   │   │           │       ├── AdminGroupController.java
│   │   │           │       ├── AdminOrderController.java
│   │   │           │       ├── AdminUserController.java
│   │   │           │       └── AdminDashboardController.java
│   │   │           ├── dto/
│   │   │           │   ├── request/
│   │   │           │   │   ├── auth/
│   │   │           │   │   ├── product/
│   │   │           │   │   ├── group/
│   │   │           │   │   ├── cart/
│   │   │           │   │   ├── order/
│   │   │           │   │   ├── address/
│   │   │           │   │   └── user/
│   │   │           │   ├── response/
│   │   │           │   │   ├── auth/
│   │   │           │   │   ├── product/
│   │   │           │   │   ├── group/
│   │   │           │   │   ├── cart/
│   │   │           │   │   ├── order/
│   │   │           │   │   ├── address/
│   │   │           │   │   └── user/
│   │   │           │   └── mapper/
│   │   │           │       ├── ProductMapper.java
│   │   │           │       ├── GroupMapper.java
│   │   │           │       ├── CartMapper.java
│   │   │           │       ├── OrderMapper.java
│   │   │           │       ├── AddressMapper.java
│   │   │           │       └── UserMapper.java
│   │   │           ├── entity/
│   │   │           │   ├── BaseEntity.java
│   │   │           │   ├── User.java
│   │   │           │   ├── Category.java
│   │   │           │   ├── Product.java
│   │   │           │   ├── GroupPurchase.java
│   │   │           │   ├── GroupParticipant.java
│   │   │           │   ├── Cart.java
│   │   │           │   ├── CartItem.java
│   │   │           │   ├── Order.java
│   │   │           │   ├── OrderItem.java
│   │   │           │   └── Address.java
│   │   │           ├── enum/
│   │   │           │   ├── UserRole.java
│   │   │           │   ├── UserStatus.java
│   │   │           │   ├── GroupStatus.java
│   │   │           │   ├── PaymentStatus.java
│   │   │           │   ├── OrderStatus.java
│   │   │           │   ├── PriceType.java
│   │   │           │   └── PaymentMethod.java
│   │   │           ├── exception/
│   │   │           │   ├── GlobalExceptionHandler.java
│   │   │           │   ├── ResourceNotFoundException.java
│   │   │           │   ├── BusinessRuleException.java
│   │   │           │   ├── ValidationException.java
│   │   │           │   ├── UnauthorizedException.java
│   │   │           │   └── ErrorResponse.java
│   │   │           ├── repository/
│   │   │           │   ├── UserRepository.java
│   │   │           │   ├── CategoryRepository.java
│   │   │           │   ├── ProductRepository.java
│   │   │           │   ├── GroupPurchaseRepository.java
│   │   │           │   ├── GroupParticipantRepository.java
│   │   │           │   ├── CartRepository.java
│   │   │           │   ├── CartItemRepository.java
│   │   │           │   ├── OrderRepository.java
│   │   │           │   ├── OrderItemRepository.java
│   │   │           │   └── AddressRepository.java
│   │   │           ├── security/
│   │   │           │   ├── JwtAuthenticationFilter.java
│   │   │           │   ├── JwtUtil.java
│   │   │           │   ├── UserDetailsServiceImpl.java
│   │   │           │   ├── CustomAccessDeniedHandler.java
│   │   │           │   └── CustomAuthenticationEntryPoint.java
│   │   │           ├── service/
│   │   │           │   ├── AuthService.java
│   │   │           │   ├── ProductService.java
│   │   │           │   ├── CategoryService.java
│   │   │           │   ├── GroupService.java
│   │   │           │   ├── CartService.java
│   │   │           │   ├── OrderService.java
│   │   │           │   ├── AddressService.java
│   │   │           │   ├── UserService.java
│   │   │           │   └── AdminDashboardService.java
│   │   │           ├── validation/
│   │   │           │   ├── GroupQuantityValidator.java
│   │   │           │   └── CartItemValidator.java
│   │   │           └── scheduler/
│   │   │               └── GroupDeadlineScheduler.java
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       ├── application-test.yml
│   │       ├── db/migration/          # Flyway migrations
│   │       │   ├── V1__init_schema.sql
│   │       │   ├── V2__add_indexes.sql
│   │       │   └── V3__seed_data.sql
│   │       └── static/                # For Swagger UI (optional)
│   └── test/
│       ├── java/
│       │   └── com/
│       │       └── gathercart/
│       │           ├── GatherCartApplicationTests.java
│       │           ├── config/
│       │           ├── controller/
│       │           ├── repository/
│       │           ├── service/
│       │           ├── security/
│       │           └── integration/
│       └── resources/
│           ├── application-test.yml
│           └── test-data/
├── pom.xml
├── mvnw
├── mvnw.cmd
├── .gitignore
└── README.md
```

---

## Frontend Structure (React + Vite)

```
frontend/
├── public/
│   ├── vite.svg
│   ├── manifest.json
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   ├── images/
│   │   ├── fonts/
│   │   └── styles/
│   │       ├── globals.css
│   │       ├── variables.css
│   │       └── tailwind.css
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.stories.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Input/
│   │   │   ├── Select/
│   │   │   ├── Modal/
│   │   │   ├── Card/
│   │   │   ├── Badge/
│   │   │   ├── ProgressBar/
│   │   │   ├── PriceDisplay/
│   │   │   ├── LoadingSkeleton/
│   │   │   ├── EmptyState/
│   │   │   ├── ErrorMessage/
│   │   │   ├── Toast/
│   │   │   ├── ConfirmDialog/
│   │   │   ├── Pagination/
│   │   │   ├── Image/
│   │   │   ├── Avatar/
│   │   │   ├── Divider/
│   │   │   ├── Tooltip/
│   │   │   ├── Dropdown/
│   │   │   ├── Tabs/
│   │   │   ├── Accordion/
│   │   │   ├── Table/
│   │   │   ├── FormField/
│   │   │   ├── Checkbox/
│   │   │   ├── RadioGroup/
│   │   │   ├── Switch/
│   │   │   ├── Textarea/
│   │   │   ├── FileUpload/
│   │   │   └── index.ts
│   │   ├── layout/
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   ├── Sidebar/
│   │   │   ├── MobileNav/
│   │   │   ├── MainLayout/
│   │   │   ├── AuthLayout/
│   │   │   ├── AdminLayout/
│   │   │   └── index.ts
│   │   ├── forms/
│   │   │   ├── LoginForm/
│   │   │   ├── RegisterForm/
│   │   │   ├── AddressForm/
│   │   │   ├── ProductForm/
│   │   │   ├── GroupForm/
│   │   │   ├── CheckoutForm/
│   │   │   └── index.ts
│   │   ├── product/
│   │   │   ├── ProductCard/
│   │   │   ├── ProductGrid/
│   │   │   ├── ProductFilters/
│   │   │   ├── ProductSearch/
│   │   │   └── index.ts
│   │   ├── group/
│   │   │   ├── GroupCard/
│   │   │   ├── GroupProgress/
│   │   │   ├── ParticipantList/
│   │   │   ├── JoinGroupModal/
│   │   │   ├── CreateGroupModal/
│   │   │   ├── PaymentProofUpload/
│   │   │   └── index.ts
│   │   ├── cart/
│   │   │   ├── CartItem/
│   │   │   ├── CartSummary/
│   │   │   ├── CartEmpty/
│   │   │   └── index.ts
│   │   ├── order/
│   │   │   ├── OrderCard/
│   │   │   ├── OrderTimeline/
│   │   │   ├── OrderItems/
│   │   │   └── index.ts
│   │   ├── admin/
│   │   │   ├── StatsCard/
│   │   │   ├── DataTable/
│   │   │   ├── ProductForm/
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── config/
│   │   ├── api.ts
│   │   ├── constants.ts
│   │   ├── routes.ts
│   │   ├── theme.ts
│   │   └── validation.ts
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useLogin.ts
│   │   │   │   └── useRegister.ts
│   │   │   ├── services/
│   │   │   │   └── authApi.ts
│   │   │   ├── store/
│   │   │   │   └── authStore.ts
│   │   │   ├── types/
│   │   │   │   └── auth.ts
│   │   │   └── index.ts
│   │   ├── products/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   │   ├── useProducts.ts
│   │   │   │   ├── useProduct.ts
│   │   │   │   └── useCategories.ts
│   │   │   ├── services/
│   │   │   │   └── productApi.ts
│   │   │   ├── store/
│   │   │   ├── types/
│   │   │   │   └── product.ts
│   │   │   └── index.ts
│   │   ├── groups/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   │   ├── useGroups.ts
│   │   │   │   ├── useGroup.ts
│   │   │   │   ├── useJoinGroup.ts
│   │   │   │   └── useCreateGroup.ts
│   │   │   ├── services/
│   │   │   │   └── groupApi.ts
│   │   │   ├── store/
│   │   │   ├── types/
│   │   │   │   └── group.ts
│   │   │   └── index.ts
│   │   ├── cart/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   │   ├── useCart.ts
│   │   │   │   └── useCartActions.ts
│   │   │   ├── services/
│   │   │   │   └── cartApi.ts
│   │   │   ├── store/
│   │   │   │   └── cartStore.ts
│   │   │   ├── types/
│   │   │   │   └── cart.ts
│   │   │   └── index.ts
│   │   ├── orders/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   │   ├── useOrders.ts
│   │   │   │   └── useOrder.ts
│   │   │   ├── services/
│   │   │   │   └── orderApi.ts
│   │   │   ├── store/
│   │   │   ├── types/
│   │   │   │   └── order.ts
│   │   │   └── index.ts
│   │   ├── addresses/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   │   └── useAddresses.ts
│   │   │   ├── services/
│   │   │   │   └── addressApi.ts
│   │   │   ├── store/
│   │   │   ├── types/
│   │   │   │   └── address.ts
│   │   │   └── index.ts
│   │   ├── profile/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   │   └── useProfile.ts
│   │   │   ├── services/
│   │   │   │   └── userApi.ts
│   │   │   ├── store/
│   │   │   ├── types/
│   │   │   │   └── user.ts
│   │   │   └── index.ts
│   │   └── admin/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       │   └── adminApi.ts
│   │       ├── store/
│   │       ├── types/
│   │       └── index.ts
│   ├── hooks/
│   │   ├── useTheme.ts
│   │   ├── useMediaQuery.ts
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useClickOutside.ts
│   │   ├── useKeyboard.ts
│   │   ├── useIntersectionObserver.ts
│   │   └── index.ts
│   ├── layouts/
│   │   ├── MainLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   ├── AdminLayout.tsx
│   │   └── index.ts
│   ├── pages/
│   │   ├── Home/
│   │   ├── Products/
│   │   │   ├── ProductListingPage.tsx
│   │   │   └── ProductDetailPage.tsx
│   │   ├── Groups/
│   │   │   ├── GroupListingPage.tsx
│   │   │   └── GroupDetailPage.tsx
│   │   ├── Cart/
│   │   │   └── CartPage.tsx
│   │   ├── Checkout/
│   │   │   └── CheckoutPage.tsx
│   │   ├── Orders/
│   │   │   ├── OrderHistoryPage.tsx
│   │   │   └── OrderDetailPage.tsx
│   │   ├── Profile/
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── AddressesPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── Auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── Admin/
│   │   │   ├── AdminDashboardPage.tsx
│   │   │   ├── AdminProductsPage.tsx
│   │   │   ├── AdminGroupsPage.tsx
│   │   │   ├── AdminOrdersPage.tsx
│   │   │   └── AdminUsersPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   └── index.ts
│   ├── services/
│   │   ├── api.ts              # Axios instance
│   │   ├── auth.ts
│   │   ├── product.ts
│   │   ├── group.ts
│   │   ├── cart.ts
│   │   ├── order.ts
│   │   ├── address.ts
│   │   ├── user.ts
│   │   └── admin.ts
│   ├── store/
│   │   ├── index.ts            # Store exports
│   │   └── useStore.ts         # Combined hooks
│   ├── types/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── product.ts
│   │   ├── group.ts
│   │   ├── cart.ts
│   │   ├── order.ts
│   │   ├── address.ts
│   │   ├── user.ts
│   │   ├── admin.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   ├── helpers.ts
│   │   ├── date.ts
│   │   ├── currency.ts
│   │   └── index.ts
│   ├── validation/
│   │   ├── schemas/
│   │   │   ├── auth.ts
│   │   │   ├── product.ts
│   │   │   ├── group.ts
│   │   │   ├── cart.ts
│   │   │   ├── order.ts
│   │   │   ├── address.ts
│   │   │   └── user.ts
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── vite-env.d.ts
│   └── routes.tsx
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── tailwind.config.ts
├── postcss.config.js
├── eslint.config.js
├── prettier.config.js
├── .gitignore
├── .env.example
├── .env.development
├── .env.production
└── README.md
```

---

## Database Migration Structure

```
backend/src/main/resources/db/migration/
├── V1__create_initial_schema.sql
├── V2__add_indexes_and_constraints.sql
├── V3__seed_categories.sql
├── V4__seed_admin_user.sql
└── V5__add_payment_fields.sql
```

### Migration Naming Convention
- `V{version}__{description}.sql`
- Version: Sequential integer (1, 2, 3...)
- Description: snake_case, descriptive
- Run automatically on startup via Flyway

---

## Docker Compose (Local Development)

```yaml
# docker-compose.yml (root)
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: gathercart-mysql
    environment:
      MYSQL_DATABASE: gathercart
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_USER: gathercart
      MYSQL_PASSWORD: gathercart
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./docker/mysql/init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: gathercart-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  mailhog:
    image: mailhog/mailhog
    container_name: gathercart-mailhog
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI

volumes:
  mysql_data:
  redis_data:
```

---

## Environment Variables

### Backend (.env / application.yml)
```yaml
# Database
SPRING_DATASOURCE_URL: jdbc:mysql://localhost:3306/gathercart?createDatabaseIfNotExist=true
SPRING_DATASOURCE_USERNAME: gathercart
SPRING_DATASOURCE_PASSWORD: gathercart

# JPA
SPRING_JPA_HIBERNATE_DDL_AUTO: validate
SPRING_JPA_SHOW_SQL: false
SPRING_JPA_PROPERTIES_HIBERNATE_FORMAT_SQL: true

# Flyway
SPRING_FLYWAY_ENABLED: true
SPRING_FLYWAY_LOCATIONS: classpath:db/migration

# JWT
JWT_SECRET: your-256-bit-secret-key-here
JWT_ACCESS_TOKEN_EXPIRY: 900000      # 15 minutes
JWT_REFRESH_TOKEN_EXPIRY: 604800000  # 7 days

# CORS
CORS_ALLOWED_ORIGINS: http://localhost:5173

# Mail (Mailhog for dev)
SPRING_MAIL_HOST: localhost
SPRING_MAIL_PORT: 1025
SPRING_MAIL_USERNAME: 
SPRING_MAIL_PASSWORD: 

# File Upload
FILE_UPLOAD_DIR: ./uploads
FILE_MAX_SIZE: 5MB

# Server
SERVER_PORT: 8080
SERVER_SERVLET_CONTEXT_PATH: /api

# Actuator
MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE: health,info,metrics
MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS: always
```

### Frontend (.env.development)
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=GatherCart
VITE_APP_DESCRIPTION=Neighbourhood group-buying grocery app
VITE_DEFAULT_PAGE_SIZE=20
VITE_MAX_FILE_SIZE=5242880
VITE_SUPPORTED_IMAGE_TYPES=image/jpeg,image/png,image/webp
```

---

## Git Structure

### Branching Strategy
```
main                    # Production-ready code
├── develop             # Integration branch
│   ├── feature/*       # Feature branches
│   ├── bugfix/*        # Bug fixes
│   └── hotfix/*        # Emergency production fixes
└── release/*           # Release preparation
```

### Commit Convention (Conventional Commits)
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`, `ci`

Examples:
```
feat(auth): add JWT token refresh endpoint
fix(cart): correct group price calculation on quantity change
docs(api): update order endpoints documentation
refactor(product): extract product service interface
```

---

## Package.json Scripts (Frontend)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:prod": "tsc && vite build --mode production",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css,md}\"",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "typecheck": "tsc --noEmit",
    "storybook": "storybook dev -p 6006",
    "build:storybook": "storybook build"
  }
}
```

---

## Maven Commands (Backend)

```bash
# Development
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Testing
./mvnw test
./mvnw verify

# Build
./mvnw clean package -DskipTests
./mvnw clean package

# Docker
./mvnw spring-boot:build-image

# Database
./mvnw flyway:migrate
./mvnw flyway:clean flyway:migrate

# Dependencies
./mvnw dependency:tree
./mvnw versions:display-dependency-updates
```

---

## IDE Configuration

### VS Code Extensions (Recommended)
```json
// .vscode/extensions.json
{
  "recommendations": [
    "vscode-java-extension.vscode-java-debug",
    "vscode-java-extension.vscode-java-test",
    "vmware.vscode-spring-boot",
    "redhat.java",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### VS Code Settings
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "java.configuration.maven.userSettings": "${workspaceFolder}/backend/settings.xml"
}
```

---

## CI/CD Pipeline Structure

```
.github/workflows/
├── backend-ci.yml          # Backend build, test, security scan
├── frontend-ci.yml         # Frontend build, test, lint
├── integration-test.yml    # Full stack integration tests
├── deploy-staging.yml      # Deploy to staging
└── deploy-production.yml   # Deploy to production (manual trigger)
```

---

## Documentation Structure

```
docs/
├── architecture/
│   ├── overview.md
│   ├── frontend.md
│   ├── backend.md
│   ├── database.md
│   └── security.md
├── api/
│   ├── auth.md
│   ├── products.md
│   ├── groups.md
│   ├── cart.md
│   ├── orders.md
│   └── admin.md
├── database/
│   ├── schema.md
│   ├── migrations.md
│   └── seeding.md
├── deployment/
│   ├── local.md
│   ├── staging.md
│   └── production.md
├── development/
│   ├── setup.md
│   ├── workflow.md
│   ├── coding-standards.md
│   └── testing.md
└── decisions/
    └── ADR-*.md            # Architecture Decision Records
```

---

## Summary of Key Directories

| Directory | Purpose |
|-----------|---------|
| `backend/src/main/java/com/gathercart` | All backend source code |
| `backend/src/main/resources` | Config, migrations, static files |
| `backend/src/test` | Backend tests |
| `frontend/src` | All frontend source code |
| `frontend/public` | Static assets served as-is |
| `docs/` | Project documentation |
| `screens/` | UI reference screenshots |
| `.github/workflows/` | CI/CD pipelines |

---

## Next Steps

1. **Create backend project** with Spring Initializr or Maven archetype
2. **Create frontend project** with `npm create vite@latest`
3. **Set up Docker Compose** for MySQL + Redis
4. **Configure Flyway** for database migrations
5. **Establish Git hooks** (Husky) for linting/formatting
6. **Configure IDE** settings for team consistency