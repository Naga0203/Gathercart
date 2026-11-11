# GatherCart

> **Buy together. Pay less.**  
> Neighbourhood group-buying grocery platform for India.

---

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router, Lucide React, Axios
- **Backend**: Java 21, Spring Boot 3.3.x, Spring Web, Spring Data JPA / Hibernate, Maven
- **Database**: Supabase PostgreSQL (Managed PostgreSQL via JDBC)
- **API**: RESTful APIs with standardized `ApiResponse<T>` envelope
- **Testing**: JUnit 5, Mockito, Spring Boot Test

---

## Project Structure

```
GatherCart/
├── frontend/             # React + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── assets/       # Static assets and icons
│   │   ├── components/   # Shared reusable UI components
│   │   ├── config/       # App constants and configuration
│   │   ├── features/     # Feature-level state and logic (Theme, etc.)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── layouts/      # App shell and page layouts
│   │   ├── pages/        # Route page views
│   │   ├── services/     # Centralized Axios API client and endpoints
│   │   ├── types/        # TypeScript data models and API types
│   │   └── utils/        # Formatting and helper utilities
│   ├── .env              # Frontend API base URL configuration
│   └── package.json
│
├── backend/              # Java 21 + Spring Boot + Supabase PostgreSQL
│   ├── src/main/java/com/gathercart/
│   │   ├── config/       # CORS, WebMvc, Security configurations
│   │   ├── controller/   # REST Controllers (HealthController, RootController, etc.)
│   │   ├── service/      # Business logic service contracts and implementations
│   │   ├── repository/   # Spring Data JPA repositories
│   │   ├── entity/       # JPA entities and BaseEntity audit superclass
│   │   ├── dto/          # Request and Response Data Transfer Objects
│   │   ├── exception/    # GlobalExceptionHandler, BusinessException, ResourceNotFoundException
│   │   ├── mapper/       # Entity to DTO mappers
│   │   ├── validation/   # Custom validators and validation groups
│   │   └── common/       # ApiResponse envelope, shared utilities
│   ├── src/main/resources/
│   │   └── application.yml
│   ├── .env              # Supabase database credentials, API key, and server port
│   ├── .env.example      # Template for environment variables
│   └── pom.xml
│
├── Screens/              # Authoritative UI Reference Screenshots (7 screens)
├── DEVELOPMENT_PLAN.md   # Multi-phase development roadmap
├── DATABASE_DESIGN.md    # Supabase PostgreSQL relational schema & constraints
├── API_CONTRACT.md       # Standardized REST endpoint specifications
└── README.md
```

---

## Quick Start (Local Development)

### 1. Prerequisites
- **Java 21 LTS**
- **Maven 3.9+**
- **Node.js 20+** and **npm**
- **Supabase Project** (PostgreSQL)

---

### 2. Configure Backend Supabase Credentials

1. Open `backend/.env` (or copy from `backend/.env.example`).
2. Add your Supabase connection string and credentials:

```env
SERVER_PORT=8081
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-or-service-role-key
DATABASE_URL=jdbc:postgresql://db.your-project-id.supabase.co:5432/postgres?sslmode=require
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-database-password
JPA_DDL_AUTO=none
JPA_SHOW_SQL=false
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

### 3. Start the Backend

```bash
cd backend
mvn spring-boot:run
```

- API Base: `http://localhost:8081/api/v1`
- Root Info: `http://localhost:8081/`
- Health check: `http://localhost:8081/api/v1/health`

---

### 4. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

- UI starts at: `http://localhost:5173`

---

## Development Milestones

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 0** | Project Discovery, UI Analysis, Planning Documents | ✅ Complete |
| **Phase 1** | Full-Stack Foundation (React + Vite + Spring Boot + Supabase PostgreSQL) | ✅ Complete |
| **Phase 2** | UI Foundation, Shell & 3-Mode Theme System | ✅ Complete |
| **Phase 3** | Product Discovery & Catalog Browsing | ⬜ Next |
| **Phase 4** | Batches & Group Buying (Pledges, Locking, Limits) | ⬜ |
| **Phase 5** | My Orders & Order Lifecycle Dashboard | ⬜ |
| **Phase 6** | UPI Payments & Digital Pickup Tokens | ⬜ |
| **Phase 7** | Spring Security & JWT Authentication | ⬜ |
| **Phase 8** | Application Enhancements & Edge Cases | ⬜ |
| **Phase 9** | E2E Testing, Security Audit & Stabilization | ⬜ |
