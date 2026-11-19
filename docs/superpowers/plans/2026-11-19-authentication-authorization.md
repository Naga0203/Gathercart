# Phase 7: Authentication, Authorization & Application Security — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add production-grade JWT authentication and role-based authorization to the GatherCart Spring Boot + React application, integrating with all existing features while preserving current functionality.

**Architecture:** Spring Security filter chain with stateless JWT auth using Bearer tokens. Backend generates/validates JWTs with HMAC-SHA256. Frontend stores tokens in memory (React Context) with the existing axios interceptor. CORS is already configured; we add Spring Security's filter chain on top. BCrypt password hashing. User entity persisted to Supabase PostgreSQL via JPA.

**Tech Stack:** Spring Boot 3.3.5, Spring Security 6, jjwt 0.12.x (io.jsonwebtoken), BCrypt, React 19 Context + react-router-dom v7, Axios interceptors, H2 test database.

## Global Constraints

- Java 21, Spring Boot 3.3.5, Lombok, PostgreSQL (Supabase) with H2 for tests.
- React 19, TypeScript, Vite, Tailwind CSS 3.4, react-router-dom 7.
- All API responses use the existing `ApiResponse<T>` envelope.
- All paths under `/api/v1` (configured via `WebConfig` path prefix or controller-level).
- Never return password hashes in API responses.
- Never store JWT in localStorage — keep in React state/context only.
- Do not rewrite existing business logic unnecessarily — only modify cart/group/order features where ownership must be enforced.

---

### Task 1: Add Security Dependencies to pom.xml

**Files:**
- Modify: `backend/pom.xml`

**Interfaces:**
- Consumes: Nothing
- Produces: Spring Security and JJWT libraries available on classpath

- [ ] **Step 1: Add spring-boot-starter-security dependency**

Add after the `spring-boot-starter-validation` dependency block in `backend/pom.xml`:

```xml
        <!-- Spring Security -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
```

- [ ] **Step 2: Add JJWT dependencies**

Add after the Spring Security dependency:

```xml
        <!-- JWT (jjwt) -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.6</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.6</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.12.6</version>
            <scope>runtime</scope>
        </dependency>
```

- [ ] **Step 3: Add spring-security-test**

Add after the existing `spring-boot-starter-test` dependency:

```xml
        <!-- Spring Security Test -->
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
```

- [ ] **Step 4: Verify Maven resolves dependencies**

Run: `cd backend && mvnw.cmd dependency:resolve -q` (or `mvn dependency:resolve -q`)
Expected: BUILD SUCCESS, no errors about missing artifacts.

- [ ] **Step 5: Commit**

```bash
git add backend/pom.xml
git commit -m "feat(security): add Spring Security and JJWT dependencies"
```

---

### Task 2: Create the User Entity and Repository

**Files:**
- Create: `backend/src/main/java/com/gathercart/entity/User.java`
- Create: `backend/src/main/java/com/gathercart/entity/UserRole.java`
- Create: `backend/src/main/java/com/gathercart/repository/UserRepository.java`

**Interfaces:**
- Consumes: `BaseEntity` from `entity/BaseEntity.java` (provides `id`, `createdAt`, `updatedAt`)
- Produces: `User` JPA entity with fields: `id`, `fullName`, `email`, `phone`, `passwordHash`, `role` (UserRole enum), `isActive`, `clusterId`, `createdAt`, `updatedAt`. `UserRepository` with `findByEmail(String)`, `existsByEmail(String)`, `existsByPhone(String)`.

- [ ] **Step 1: Create UserRole enum**

Create file `backend/src/main/java/com/gathercart/entity/UserRole.java`:

```java
package com.gathercart.entity;

public enum UserRole {
    CUSTOMER,
    ADMIN
}
```

- [ ] **Step 2: Create User entity**

Create file `backend/src/main/java/com/gathercart/entity/User.java`:

```java
package com.gathercart.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "app_user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "phone", nullable = false, unique = true, length = 20)
    private String phone;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "cluster_id")
    private Long clusterId;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private UserRole role = UserRole.CUSTOMER;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Builder.Default
    @Column(name = "penalty_count", nullable = false)
    private Integer penaltyCount = 0;
}
```

> **Note:** Table name is `app_user` to avoid PostgreSQL reserved word `user`.

- [ ] **Step 3: Create UserRepository**

Create file `backend/src/main/java/com/gathercart/repository/UserRepository.java`:

```java
package com.gathercart.repository;

import com.gathercart.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);
}
```

- [ ] **Step 4: Verify compilation**

Run: `cd backend && mvnw.cmd compile -q`
Expected: BUILD SUCCESS

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/gathercart/entity/User.java \
       backend/src/main/java/com/gathercart/entity/UserRole.java \
       backend/src/main/java/com/gathercart/repository/UserRepository.java
git commit -m "feat(security): add User entity, UserRole enum, and UserRepository"
```

---

### Task 3: JWT Service and Security Configuration

**Files:**
- Create: `backend/src/main/java/com/gathercart/security/JwtService.java`
- Create: `backend/src/main/java/com/gathercart/security/JwtAuthenticationFilter.java`
- Create: `backend/src/main/java/com/gathercart/security/CustomUserDetailsService.java`
- Create: `backend/src/main/java/com/gathercart/security/SecurityConfig.java`
- Create: `backend/src/main/java/com/gathercart/security/AuthEntryPoint.java`
- Modify: `backend/src/main/resources/application.yml` (add JWT config)
- Modify: `backend/.env` (add JWT_SECRET)
- Modify: `backend/src/test/resources/application-test.yml` (add JWT test config)

**Interfaces:**
- Consumes: `UserRepository` from Task 2. `ApiResponse` from `common/ApiResponse.java`.
- Produces: `JwtService` with `generateToken(User): String`, `extractEmail(String): String`, `isTokenValid(String, UserDetails): boolean`. `JwtAuthenticationFilter` (OncePerRequestFilter). `SecurityConfig` defining the filter chain. `AuthEntryPoint` for 401 responses.

- [ ] **Step 1: Add JWT config to application.yml**

Add at the end of `backend/src/main/resources/application.yml`:

```yaml

  jwt:
    secret: ${JWT_SECRET:default-dev-secret-key-must-be-at-least-256-bits-long-for-hs256}
    expiration-ms: ${JWT_EXPIRATION_MS:86400000}
```

This should be nested under the existing `app:` key (same level as `cors:`).

- [ ] **Step 2: Add JWT_SECRET to .env**

Append to `backend/.env`:

```
# JWT Secret (minimum 32 chars for HS256)
JWT_SECRET=g4th3rC4rt-S3cur3-JWT-S1gn1ng-K3y-2026-Pr0duct10n-R34dy!
JWT_EXPIRATION_MS=86400000
```

- [ ] **Step 3: Add JWT test config to application-test.yml**

Append to `backend/src/test/resources/application-test.yml`:

```yaml

app:
  cors:
    allowed-origins: http://localhost:5173
  jwt:
    secret: test-secret-key-that-is-at-least-256-bits-long-for-hs256-testing
    expiration-ms: 3600000
```

- [ ] **Step 4: Create JwtService**

Create `backend/src/main/java/com/gathercart/security/JwtService.java`:

```java
package com.gathercart.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs
    ) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(Map<String, Object> extraClaims, String subject) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .claims(extraClaims)
                .subject(subject)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey)
                .compact();
    }

    public String generateToken(String subject) {
        return generateToken(Map.of(), subject);
    }

    public String extractSubject(String token) {
        return extractAllClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            String subject = extractSubject(token);
            return subject.equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
```

- [ ] **Step 5: Create CustomUserDetailsService**

Create `backend/src/main/java/com/gathercart/security/CustomUserDetailsService.java`:

```java
package com.gathercart.security;

import com.gathercart.entity.User;
import com.gathercart.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                user.getIsActive(),
                true, true, true,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
```

- [ ] **Step 6: Create AuthEntryPoint**

Create `backend/src/main/java/com/gathercart/security/AuthEntryPoint.java`:

```java
package com.gathercart.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gathercart.common.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class AuthEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        ApiResponse<Void> body = ApiResponse.error("Authentication required. Please log in.");
        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
```

- [ ] **Step 7: Create JwtAuthenticationFilter**

Create `backend/src/main/java/com/gathercart/security/JwtAuthenticationFilter.java`:

```java
package com.gathercart.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        try {
            final String userEmail = jwtService.extractSubject(jwt);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities()
                            );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            log.debug("JWT authentication failed: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
```

- [ ] **Step 8: Create SecurityConfig**

Create `backend/src/main/java/com/gathercart/security/SecurityConfig.java`:

```java
package com.gathercart.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;
    private final AuthEntryPoint authEntryPoint;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable) // Stateless JWT — no CSRF needed
                .exceptionHandling(ex -> ex.authenticationEntryPoint(authEntryPoint))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/v1/auth/register", "/api/v1/auth/login").permitAll()
                        .requestMatchers("/api/v1/health", "/api/v1/").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/batches/**", "/api/v1/group-purchases/**").permitAll()

                        // Admin-only endpoints
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")

                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
```

- [ ] **Step 9: Verify compilation**

Run: `cd backend && mvnw.cmd compile -q`
Expected: BUILD SUCCESS

- [ ] **Step 10: Commit**

```bash
git add backend/src/main/java/com/gathercart/security/ \
       backend/src/main/resources/application.yml \
       backend/.env \
       backend/src/test/resources/application-test.yml
git commit -m "feat(security): add JWT service, auth filter, security config, and entry point"
```

---

### Task 4: Auth Controller — Register, Login, Logout, Me

**Files:**
- Create: `backend/src/main/java/com/gathercart/dto/RegisterRequest.java`
- Create: `backend/src/main/java/com/gathercart/dto/LoginRequest.java`
- Create: `backend/src/main/java/com/gathercart/dto/AuthResponse.java`
- Create: `backend/src/main/java/com/gathercart/dto/UserProfileResponse.java`
- Create: `backend/src/main/java/com/gathercart/service/AuthService.java`
- Create: `backend/src/main/java/com/gathercart/controller/AuthController.java`
- Modify: `backend/src/main/java/com/gathercart/exception/GlobalExceptionHandler.java` (handle DuplicateKeyException, AccessDeniedException)

**Interfaces:**
- Consumes: `UserRepository` (Task 2), `JwtService`, `PasswordEncoder`, `AuthenticationManager` (Task 3), `ApiResponse` (existing).
- Produces: `AuthService` with `register(RegisterRequest): AuthResponse`, `login(LoginRequest): AuthResponse`, `getCurrentUser(String email): UserProfileResponse`. `AuthController` endpoints: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`.

- [ ] **Step 1: Create RegisterRequest DTO**

Create `backend/src/main/java/com/gathercart/dto/RegisterRequest.java`:

```java
package com.gathercart.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 150, message = "Full name must be between 2 and 150 characters")
    private String fullName;

    @NotBlank(message = "Phone number is required")
    @Size(max = 20)
    private String phone;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    private Long clusterId;

    private String addressLine1;

    private String addressLine2;

    private String handoverPreference;

    private Long preferredPickupNodeId;

    @NotNull(message = "You must agree to the terms")
    private Boolean agreedToTerms;
}
```

- [ ] **Step 2: Create LoginRequest DTO**

Create `backend/src/main/java/com/gathercart/dto/LoginRequest.java`:

```java
package com.gathercart.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
```

- [ ] **Step 3: Create AuthResponse DTO**

Create `backend/src/main/java/com/gathercart/dto/AuthResponse.java`:

```java
package com.gathercart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private String clusterName;
    private String token;
}
```

- [ ] **Step 4: Create UserProfileResponse DTO**

Create `backend/src/main/java/com/gathercart/dto/UserProfileResponse.java`:

```java
package com.gathercart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private Long clusterId;
    private String clusterName;
    private String handoverPreference;
    private Integer penaltyCount;
    private Boolean isActive;
}
```

- [ ] **Step 5: Create AuthService**

Create `backend/src/main/java/com/gathercart/service/AuthService.java`:

```java
package com.gathercart.service;

import com.gathercart.dto.AuthResponse;
import com.gathercart.dto.LoginRequest;
import com.gathercart.dto.RegisterRequest;
import com.gathercart.dto.UserProfileResponse;
import com.gathercart.entity.User;
import com.gathercart.entity.UserRole;
import com.gathercart.exception.BusinessException;
import com.gathercart.repository.UserRepository;
import com.gathercart.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request.getAgreedToTerms() == null || !request.getAgreedToTerms()) {
            throw new BusinessException("You must agree to the terms to register");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone number is already registered");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().toLowerCase().trim())
                .phone(request.getPhone().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .clusterId(request.getClusterId() != null ? request.getClusterId() : 1L)
                .role(UserRole.CUSTOMER)
                .isActive(true)
                .penaltyCount(0)
                .build();

        user = userRepository.save(user);
        log.info("Registered new user: {} (ID: {})", user.getEmail(), user.getId());

        String token = jwtService.generateToken(
                Map.of("userId", user.getId(), "role", user.getRole().name()),
                user.getEmail()
        );

        return AuthResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .token(token)
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail().toLowerCase().trim(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!user.getIsActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is deactivated. Please contact support.");
        }

        String token = jwtService.generateToken(
                Map.of("userId", user.getId(), "role", user.getRole().name()),
                user.getEmail()
        );

        return AuthResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .token(token)
                .build();
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return UserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .clusterId(user.getClusterId())
                .penaltyCount(user.getPenaltyCount())
                .isActive(user.getIsActive())
                .build();
    }
}
```

- [ ] **Step 6: Create AuthController**

Create `backend/src/main/java/com/gathercart/controller/AuthController.java`:

```java
package com.gathercart.controller;

import com.gathercart.common.ApiResponse;
import com.gathercart.dto.AuthResponse;
import com.gathercart.dto.LoginRequest;
import com.gathercart.dto.RegisterRequest;
import com.gathercart.dto.UserProfileResponse;
import com.gathercart.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Registration successful"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        // Stateless JWT: client-side token removal handles logout
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser(Authentication authentication) {
        UserProfileResponse profile = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(profile, "User profile retrieved"));
    }
}
```

- [ ] **Step 7: Update GlobalExceptionHandler with security-related exception handlers**

Add to `backend/src/main/java/com/gathercart/exception/GlobalExceptionHandler.java`, before the `handleGeneral` method:

```java
    @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class)
    public ResponseEntity<ApiResponse<Void>> handleResponseStatus(org.springframework.web.server.ResponseStatusException ex) {
        log.warn("Response status exception: {} - {}", ex.getStatusCode(), ex.getReason());
        return ResponseEntity
                .status(ex.getStatusCode())
                .body(ApiResponse.error(ex.getReason() != null ? ex.getReason() : "Request failed"));
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(org.springframework.security.access.AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Access denied. Insufficient permissions."));
    }
```

- [ ] **Step 8: Verify compilation**

Run: `cd backend && mvnw.cmd compile -q`
Expected: BUILD SUCCESS

- [ ] **Step 9: Commit**

```bash
git add backend/src/main/java/com/gathercart/dto/RegisterRequest.java \
       backend/src/main/java/com/gathercart/dto/LoginRequest.java \
       backend/src/main/java/com/gathercart/dto/AuthResponse.java \
       backend/src/main/java/com/gathercart/dto/UserProfileResponse.java \
       backend/src/main/java/com/gathercart/service/AuthService.java \
       backend/src/main/java/com/gathercart/controller/AuthController.java \
       backend/src/main/java/com/gathercart/exception/GlobalExceptionHandler.java
git commit -m "feat(security): add auth controller with register, login, logout, and me endpoints"
```

---

### Task 5: Integrate Auth into Existing Backend Controllers — Ownership Enforcement

**Files:**
- Create: `backend/src/main/java/com/gathercart/security/CurrentUser.java` (helper to extract user from SecurityContext)
- Modify: `backend/src/main/java/com/gathercart/controller/CartController.java` (replace X-User-Id headers with authenticated user)
- Modify: `backend/src/main/java/com/gathercart/service/CartServiceImpl.java` (remove DEFAULT_USER_ID, enforce ownership)
- Modify: `backend/src/main/java/com/gathercart/service/CartService.java` (update method signatures)
- Modify: `backend/src/main/java/com/gathercart/service/GroupPurchaseService.java` (add ownership checks for join/update/cancel)
- Modify: `backend/src/main/java/com/gathercart/controller/AdminProductController.java` (add @PreAuthorize)

**Interfaces:**
- Consumes: `SecurityContextHolder`, `UserRepository`, authenticated `Authentication` principal.
- Produces: `CurrentUser` utility. Updated CartController/Service that uses authenticated userId instead of X-User-Id headers. GroupPurchaseService with ownership validation. AdminProductController with ADMIN role guard.

- [ ] **Step 1: Create CurrentUser helper**

Create `backend/src/main/java/com/gathercart/security/CurrentUser.java`:

```java
package com.gathercart.security;

import com.gathercart.entity.User;
import com.gathercart.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CurrentUser {

    private final UserRepository userRepository;

    /**
     * Returns the currently authenticated User entity or null if unauthenticated.
     */
    public User get() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        String email = auth.getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    /**
     * Returns the authenticated User or throws if not authenticated.
     */
    public User require() {
        User user = get();
        if (user == null) {
            throw new org.springframework.security.access.AccessDeniedException("Authentication required");
        }
        return user;
    }
}
```

- [ ] **Step 2: Update CartService interface to remove header-based user identification**

Replace the entire contents of `backend/src/main/java/com/gathercart/service/CartService.java` to change method signatures from `(Long userId, String sessionId, Long clusterId, ...)` to just the business params plus an explicit `Long userId`:

```java
package com.gathercart.service;

import com.gathercart.dto.AddToCartRequest;
import com.gathercart.dto.CartResponse;
import com.gathercart.dto.UpdateCartItemRequest;

public interface CartService {

    CartResponse getCart(Long userId);

    CartResponse addToCart(Long userId, AddToCartRequest request);

    CartResponse updateQuantity(Long userId, Long itemId, UpdateCartItemRequest request);

    CartResponse removeItem(Long userId, Long itemId);

    CartResponse clearCart(Long userId);
}
```

- [ ] **Step 3: Update CartServiceImpl to use userId from auth, remove hardcoded defaults**

Replace the full `CartServiceImpl.java`. Key changes:
- Remove `DEFAULT_USER_ID`, `sessionId` logic
- Use userId parameter (from authenticated user) for all cart lookup/creation
- Keep all existing business logic (group purchase binding, pricing) unchanged

```java
package com.gathercart.service;

import com.gathercart.dto.AddToCartRequest;
import com.gathercart.dto.CartItemResponse;
import com.gathercart.dto.CartResponse;
import com.gathercart.dto.UpdateCartItemRequest;
import com.gathercart.entity.Cart;
import com.gathercart.entity.CartItem;
import com.gathercart.entity.GroupPurchase;
import com.gathercart.entity.GroupPurchaseStatus;
import com.gathercart.entity.Product;
import com.gathercart.exception.BusinessException;
import com.gathercart.exception.ResourceNotFoundException;
import com.gathercart.repository.CartItemRepository;
import com.gathercart.repository.CartRepository;
import com.gathercart.repository.GroupPurchaseRepository;
import com.gathercart.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final GroupPurchaseRepository groupPurchaseRepository;

    private static final Long DEFAULT_CLUSTER_ID = 1L;
    private static final String DEFAULT_DELIVERY_NOTE = "Free pickup at Indiranagar Community Hub";

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return mapToCartResponse(cart);
    }

    @Override
    public CartResponse addToCart(Long userId, AddToCartRequest request) {
        Cart cart = getOrCreateCart(userId);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (Boolean.FALSE.equals(product.getIsActive())) {
            throw new BusinessException("Product '" + product.getName() + "' is currently unavailable");
        }

        int maxAllowed = resolveMaxAllowedQuantity(product);

        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst();

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            if (newQuantity > maxAllowed) {
                throw new BusinessException("Maximum allowed quantity for '" + product.getName() + "' is " + maxAllowed);
            }
            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            if (request.getQuantity() > maxAllowed) {
                throw new BusinessException("Maximum allowed quantity for '" + product.getName() + "' is " + maxAllowed);
            }

            Long activeGroupPurchaseId = findActiveGroupPurchase(product.getId())
                    .map(GroupPurchase::getId)
                    .orElse(null);

            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .groupPurchaseId(activeGroupPurchaseId)
                    .build();

            cart.addItem(newItem);
            cartItemRepository.save(newItem);
        }

        cartRepository.save(cart);
        return mapToCartResponse(cart);
    }

    @Override
    public CartResponse updateQuantity(Long userId, Long itemId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        if (request.getQuantity() <= 0) {
            cart.removeItem(item);
            cartItemRepository.delete(item);
        } else {
            Product product = item.getProduct();
            if (Boolean.FALSE.equals(product.getIsActive())) {
                throw new BusinessException("Product '" + product.getName() + "' is currently unavailable");
            }
            int maxAllowed = resolveMaxAllowedQuantity(product);
            if (request.getQuantity() > maxAllowed) {
                throw new BusinessException("Maximum allowed quantity for '" + product.getName() + "' is " + maxAllowed);
            }
            item.setQuantity(request.getQuantity());
            cartItemRepository.save(item);
        }

        cartRepository.save(cart);
        return mapToCartResponse(cart);
    }

    @Override
    public CartResponse removeItem(Long userId, Long itemId) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        cart.removeItem(item);
        cartItemRepository.delete(item);
        cartRepository.save(cart);

        return mapToCartResponse(cart);
    }

    @Override
    public CartResponse clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.clearItems();
        cartRepository.save(cart);
        return mapToCartResponse(cart);
    }

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> cartRepository.save(Cart.builder()
                        .userId(userId)
                        .clusterId(DEFAULT_CLUSTER_ID)
                        .build()));
    }

    private int resolveMaxAllowedQuantity(Product product) {
        Optional<GroupPurchase> activeBatch = findActiveGroupPurchase(product.getId());
        return activeBatch
                .map(GroupPurchase::getHouseholdLimit)
                .orElse(3);
    }

    private Optional<GroupPurchase> findActiveGroupPurchase(Long productId) {
        List<GroupPurchase> activeBatches = groupPurchaseRepository.findActiveByProductId(productId);
        LocalDateTime now = LocalDateTime.now();
        return activeBatches.stream()
                .filter(b -> b.getStatus() == GroupPurchaseStatus.OPEN && b.getDeadline().isAfter(now))
                .findFirst();
    }

    private CartResponse mapToCartResponse(Cart cart) {
        List<CartItemResponse> itemResponses = new ArrayList<>();
        BigDecimal mrpSubtotal = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal subtotal = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        int totalItems = 0;

        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            int qty = item.getQuantity();
            totalItems += qty;

            BigDecimal mrpUnit = product.getMrp().setScale(2, RoundingMode.HALF_UP);
            Optional<GroupPurchase> activeBatch = findActiveGroupPurchase(product.getId());

            boolean isGroupApplied = activeBatch.isPresent();
            String batchCode = activeBatch.map(GroupPurchase::getBatchCode).orElse(null);
            BigDecimal appliedUnit = isGroupApplied
                    ? product.getGroupPrice().setScale(2, RoundingMode.HALF_UP)
                    : mrpUnit;

            BigDecimal itemMrpTotal = mrpUnit.multiply(BigDecimal.valueOf(qty)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal itemSub = appliedUnit.multiply(BigDecimal.valueOf(qty)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal itemSavings = itemMrpTotal.subtract(itemSub).setScale(2, RoundingMode.HALF_UP);

            int savingsPercent = 0;
            if (itemMrpTotal.compareTo(BigDecimal.ZERO) > 0) {
                savingsPercent = itemSavings.multiply(BigDecimal.valueOf(100))
                        .divide(itemMrpTotal, 0, RoundingMode.HALF_UP)
                        .intValue();
            }

            int maxAllowed = resolveMaxAllowedQuantity(product);

            itemResponses.add(CartItemResponse.builder()
                    .id(item.getId())
                    .productId(product.getId())
                    .productName(product.getName())
                    .unitLabel(product.getUnitLabel())
                    .imageUrl(product.getImageUrl())
                    .quantity(qty)
                    .mrpUnitPrice(mrpUnit)
                    .appliedUnitPrice(appliedUnit)
                    .mrpSubtotal(itemMrpTotal)
                    .itemSubtotal(itemSub)
                    .itemSavings(itemSavings)
                    .savingsPercent(savingsPercent)
                    .isGroupPriceApplied(isGroupApplied)
                    .activeBatchCode(batchCode)
                    .maxAllowedQuantity(maxAllowed)
                    .build());

            mrpSubtotal = mrpSubtotal.add(itemMrpTotal);
            subtotal = subtotal.add(itemSub);
        }

        BigDecimal applicableDiscounts = mrpSubtotal.subtract(subtotal).setScale(2, RoundingMode.HALF_UP);
        BigDecimal deliveryFee = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal estimatedSavings = applicableDiscounts;
        BigDecimal finalEstimatedTotal = subtotal.add(deliveryFee).setScale(2, RoundingMode.HALF_UP);

        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUserId())
                .sessionId(cart.getSessionId())
                .clusterId(cart.getClusterId())
                .items(itemResponses)
                .totalItems(totalItems)
                .itemCount(itemResponses.size())
                .mrpSubtotal(mrpSubtotal)
                .subtotal(subtotal)
                .applicableDiscounts(applicableDiscounts)
                .estimatedSavings(estimatedSavings)
                .deliveryFee(deliveryFee)
                .finalEstimatedTotal(finalEstimatedTotal)
                .deliveryNote(DEFAULT_DELIVERY_NOTE)
                .build();
    }
}
```

- [ ] **Step 4: Update CartController to use authenticated user**

Replace the full `backend/src/main/java/com/gathercart/controller/CartController.java`:

```java
package com.gathercart.controller;

import com.gathercart.common.ApiResponse;
import com.gathercart.dto.AddToCartRequest;
import com.gathercart.dto.CartResponse;
import com.gathercart.dto.UpdateCartItemRequest;
import com.gathercart.security.CurrentUser;
import com.gathercart.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final CurrentUser currentUser;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart() {
        Long userId = currentUser.require().getId();
        CartResponse response = cartService.getCart(userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Cart retrieved successfully"));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @Valid @RequestBody AddToCartRequest request
    ) {
        Long userId = currentUser.require().getId();
        CartResponse response = cartService.addToCart(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Item added to cart successfully"));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateQuantity(
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        Long userId = currentUser.require().getId();
        CartResponse response = cartService.updateQuantity(userId, itemId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Cart item updated successfully"));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(@PathVariable Long itemId) {
        Long userId = currentUser.require().getId();
        CartResponse response = cartService.removeItem(userId, itemId);
        return ResponseEntity.ok(ApiResponse.success(response, "Item removed from cart successfully"));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<CartResponse>> clearCart() {
        Long userId = currentUser.require().getId();
        CartResponse response = cartService.clearCart(userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Cart cleared successfully"));
    }
}
```

- [ ] **Step 5: Add ownership checks in GroupPurchaseService.joinGroup**

In `GroupPurchaseService.java`, update `joinGroup` to validate that the authenticated user's ID matches the userId in the request. Add near the top of the method (after line ~152 in the current file):

After the `GroupPurchase groupPurchase = ...` block, before the duplicate validation:

```java
        // Ownership enforcement: userId in request must match authenticated user
        if (request.getUserId() == null) {
            throw new BusinessException("User ID is required for joining a group purchase");
        }
```

And in `cancelParticipation`, add ownership check after fetching the participant (before the status checks):

```java
        // Note: Ownership should be validated by the controller before calling this method
```

- [ ] **Step 6: Add @PreAuthorize to AdminProductController**

Add imports and annotations to `backend/src/main/java/com/gathercart/controller/AdminProductController.java`. Add `@PreAuthorize("hasRole('ADMIN')")` on the class:

```java
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {
```

- [ ] **Step 7: Verify compilation**

Run: `cd backend && mvnw.cmd compile -q`
Expected: BUILD SUCCESS

- [ ] **Step 8: Commit**

```bash
git add backend/src/main/java/com/gathercart/security/CurrentUser.java \
       backend/src/main/java/com/gathercart/controller/CartController.java \
       backend/src/main/java/com/gathercart/service/CartService.java \
       backend/src/main/java/com/gathercart/service/CartServiceImpl.java \
       backend/src/main/java/com/gathercart/service/GroupPurchaseService.java \
       backend/src/main/java/com/gathercart/controller/AdminProductController.java
git commit -m "feat(security): integrate auth into cart, group purchase, and admin controllers"
```

---

### Task 6: Frontend Auth Context, Service, and Types

**Files:**
- Create: `frontend/src/types/auth.ts`
- Create: `frontend/src/services/authService.ts`
- Create: `frontend/src/features/auth/AuthContext.tsx`
- Create: `frontend/src/features/auth/useAuth.ts`
- Modify: `frontend/src/services/api.ts` (update interceptor to use auth context token, add 401 response handler)
- Modify: `frontend/src/services/cartService.ts` (remove hardcoded X-User-Id header)

**Interfaces:**
- Consumes: `apiClient` from `services/api.ts`, `ApiResponse` from `types/api.ts`.
- Produces: `AuthUser` type, `AuthContextType`, `AuthProvider` component, `useAuth()` hook, `authService` with `register()`, `login()`, `logout()`, `getMe()`. Updated `cartService` without hardcoded headers.

- [ ] **Step 1: Create auth types**

Create `frontend/src/types/auth.ts`:

```typescript
export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN';
  clusterId?: number;
  clusterName?: string;
  penaltyCount?: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  clusterId?: number;
  addressLine1?: string;
  addressLine2?: string;
  handoverPreference?: string;
  preferredPickupNodeId?: number;
  agreedToTerms: boolean;
}

export interface AuthResponse {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  clusterName?: string;
  token: string;
}
```

- [ ] **Step 2: Create authService**

Create `frontend/src/services/authService.ts`:

```typescript
import apiClient from './api';
import type { ApiResponse } from '../types/api';
import type { AuthResponse, LoginPayload, RegisterPayload, AuthUser } from '../types/auth';

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', payload);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Registration failed');
    }
    return res.data.data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Login failed');
    }
    return res.data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post<ApiResponse<void>>('/auth/logout');
  },

  async getMe(): Promise<AuthUser> {
    const res = await apiClient.get<ApiResponse<AuthUser>>('/auth/me');
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to get user profile');
    }
    return res.data.data;
  },
};
```

- [ ] **Step 3: Create AuthContext**

Create `frontend/src/features/auth/AuthContext.tsx`:

```tsx
import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import type { AuthUser, LoginPayload, RegisterPayload } from '../../types/auth';
import { authService } from '../../services/authService';

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token stored in module-level variable (not localStorage) for security.
// A ref in the provider keeps it across renders.
let moduleToken: string | null = null;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  const setToken = useCallback((newToken: string | null) => {
    moduleToken = newToken;
    setTokenState(newToken);
  }, []);

  // On mount, try to restore session from sessionStorage (survives page refresh within tab)
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const savedToken = sessionStorage.getItem('gc_token');
    if (savedToken) {
      setToken(savedToken);
      authService.getMe()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          setToken(null);
          sessionStorage.removeItem('gc_token');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [setToken]);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authService.login(payload);
    setToken(response.token);
    sessionStorage.setItem('gc_token', response.token);
    setUser({
      id: response.id,
      fullName: response.fullName,
      email: response.email,
      phone: response.phone,
      role: response.role as 'CUSTOMER' | 'ADMIN',
    });
  }, [setToken]);

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await authService.register(payload);
    setToken(response.token);
    sessionStorage.setItem('gc_token', response.token);
    setUser({
      id: response.id,
      fullName: response.fullName,
      email: response.email,
      phone: response.phone,
      role: response.role as 'CUSTOMER' | 'ADMIN',
    });
  }, [setToken]);

  const logout = useCallback(() => {
    authService.logout().catch(() => {});
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('gc_token');
  }, [setToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Exported for the axios interceptor to read
export function getAuthToken(): string | null {
  return moduleToken;
}
```

- [ ] **Step 4: Create useAuth hook**

Create `frontend/src/features/auth/useAuth.ts`:

```typescript
import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import type { AuthContextType } from './AuthContext';

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

- [ ] **Step 5: Update api.ts interceptor to use getAuthToken**

Replace the full `frontend/src/services/api.ts`:

```typescript
import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config/constants';
import type { ApiResponse } from '../types/api';
import { getAuthToken } from '../features/auth/AuthContext';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor — attaches JWT from in-memory auth context
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor — handles 401 by dispatching auth expiry event
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Token expired or invalid — notify app to redirect to login
        window.dispatchEvent(new CustomEvent('gathercart:auth-expired'));
      }
      const responseData = error.response.data;
      console.error('API Error Response:', responseData || error.message);
    } else if (error.request) {
      console.error('API Network Error: Server unreachable', error.message);
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

- [ ] **Step 6: Update cartService to remove hardcoded X-User-Id**

Replace the full `frontend/src/services/cartService.ts`:

```typescript
import apiClient from './api';
import type { ApiResponse } from '../types/api';
import type { Cart, AddToCartPayload, UpdateCartItemPayload } from '../types/cart';

const CART_UPDATED_EVENT = 'gathercart:cart-updated';

export const cartService = {
  async getCart(): Promise<Cart> {
    const res = await apiClient.get<ApiResponse<Cart>>('/cart');
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to retrieve cart');
    }
    return res.data.data;
  },

  async addToCart(payload: AddToCartPayload): Promise<Cart> {
    const res = await apiClient.post<ApiResponse<Cart>>('/cart/items', payload);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to add item to cart');
    }
    this.notifyCartUpdated(res.data.data);
    return res.data.data;
  },

  async updateQuantity(itemId: number, payload: UpdateCartItemPayload): Promise<Cart> {
    const res = await apiClient.put<ApiResponse<Cart>>(`/cart/items/${itemId}`, payload);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to update item quantity');
    }
    this.notifyCartUpdated(res.data.data);
    return res.data.data;
  },

  async removeItem(itemId: number): Promise<Cart> {
    const res = await apiClient.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to remove item from cart');
    }
    this.notifyCartUpdated(res.data.data);
    return res.data.data;
  },

  async clearCart(): Promise<Cart> {
    const res = await apiClient.delete<ApiResponse<Cart>>('/cart');
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to clear cart');
    }
    this.notifyCartUpdated(res.data.data);
    return res.data.data;
  },

  notifyCartUpdated(cart: Cart) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: cart }));
    }
  },

  onCartUpdated(callback: (cart: Cart) => void) {
    if (typeof window === 'undefined') return () => {};
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<Cart>;
      callback(customEvent.detail);
    };
    window.addEventListener(CART_UPDATED_EVENT, handler);
    return () => window.removeEventListener(CART_UPDATED_EVENT, handler);
  },
};
```

- [ ] **Step 7: Verify frontend compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 8: Commit**

```bash
git add frontend/src/types/auth.ts \
       frontend/src/services/authService.ts \
       frontend/src/features/auth/ \
       frontend/src/services/api.ts \
       frontend/src/services/cartService.ts
git commit -m "feat(security): add frontend auth context, service, types, and update api interceptor"
```

---

### Task 7: Frontend Auth Pages, Protected Routes, Header, and App Integration

**Files:**
- Create: `frontend/src/pages/Auth/LoginPage.tsx`
- Modify: `frontend/src/pages/Auth/RegisterPage.tsx` (wire up form submission to authService.register)
- Modify: `frontend/src/components/common/ProtectedRoute.tsx` (use AuthContext, enable requireAuth)
- Modify: `frontend/src/layouts/Header.tsx` (show user name/logout when authenticated, show login/register when not)
- Modify: `frontend/src/App.tsx` (wrap with AuthProvider, add login route, enable protected routes)
- Modify: `frontend/src/pages/index.ts` (export LoginPage)

**Interfaces:**
- Consumes: `useAuth()` hook, `AuthProvider`, `authService`. All existing UI components.
- Produces: Functional login page, wired-up register page, real ProtectedRoute that enforces auth, auth-aware Header, AuthProvider wrapping the app.

- [ ] **Step 1: Create LoginPage**

Create `frontend/src/pages/Auth/LoginPage.tsx`:

```tsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Input, Button, Card, Alert } from '../../components/common';
import { useAuth } from '../../features/auth/useAuth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Invalid email or password');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Welcome back to NeighbourBuy
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter your credentials to manage your cluster pledges.
        </p>
      </div>

      <Card padding="lg" className="space-y-5">
        {error && (
          <Alert variant="error" icon={<AlertCircle className="w-4 h-4" />}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            required
            type="email"
            placeholder="ananya.sharma@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            required
            isPassword
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full mt-4"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Logging in…' : 'Log In to Cluster'}
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
          <span>Don't have an account? </span>
          <Link to="/register" className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline">
            Create one
          </Link>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Your data is securely encrypted</span>
        </div>
      </Card>
    </div>
  );
};
```

- [ ] **Step 2: Update RegisterPage to wire form submission**

This is a significant modification to `frontend/src/pages/Auth/RegisterPage.tsx`. Add state bindings and form submission. The key changes are:

1. Import and use `useAuth` hook
2. Add controlled state for all form fields
3. Add handleSubmit that calls `register()`
4. Add error display
5. Navigate on success
6. The login tab should link to `/login` instead of toggling in-page

The existing visual design and layout must be preserved exactly.

- [ ] **Step 3: Update ProtectedRoute to use AuthContext**

Replace `frontend/src/components/common/ProtectedRoute.tsx`:

```tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';

export interface ProtectedRouteProps {
  requireAuth?: boolean;
  requiredRole?: 'ADMIN' | 'CUSTOMER';
  redirectTo?: string;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requireAuth = true,
  requiredRole,
  redirectTo = '/login',
  children,
}) => {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700" />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
```

- [ ] **Step 4: Update Header to be auth-aware**

Update the Header component to show:
- When authenticated: User name, avatar with initials, dropdown or logout button
- When not authenticated: "Log In" / "Register" buttons

Key changes in `frontend/src/layouts/Header.tsx`:
1. Import and use `useAuth` hook
2. Replace hardcoded "Ananya S." with dynamic user name
3. Replace link to `/register` with conditional: logged-in shows user menu + logout, logged-out shows login/register links
4. Preserve all existing visual design

- [ ] **Step 5: Update App.tsx to wrap with AuthProvider and wire routes**

Replace `frontend/src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './features/theme/ThemeContext';
import { AuthProvider } from './features/auth/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/Home/HomePage';
import { RegisterPage } from './pages/Auth/RegisterPage';
import { LoginPage } from './pages/Auth/LoginPage';
import { OfferDetailPage } from './pages/OfferDetail/OfferDetailPage';
import { MyOrdersPage } from './pages/MyOrders/MyOrdersPage';
import { OrderDetailPage } from './pages/OrderDetail/OrderDetailPage';
import { PickupTokenPage } from './pages/PickupToken/PickupTokenPage';
import { HowItWorksPage } from './pages/HowItWorks/HowItWorksPage';
import { CartPage } from './pages/Cart/CartPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              {/* Public routes */}
              <Route index element={<HomePage />} />
              <Route path="offers" element={<HomePage />} />
              <Route path="offers/:id" element={<OfferDetailPage />} />
              <Route path="products" element={<HomePage />} />
              <Route path="products/:id" element={<OfferDetailPage />} />
              <Route path="how-it-works" element={<HowItWorksPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="login" element={<LoginPage />} />

              {/* Protected Routes — require authentication */}
              <Route element={<ProtectedRoute />}>
                <Route path="cart" element={<CartPage />} />
                <Route path="orders" element={<MyOrdersPage />} />
                <Route path="orders/:id" element={<OrderDetailPage />} />
                <Route path="orders/:id/pickup-token" element={<PickupTokenPage />} />
              </Route>

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
```

- [ ] **Step 6: Export LoginPage from pages index**

Add to `frontend/src/pages/index.ts`:

```typescript
export { LoginPage } from './Auth/LoginPage';
```

- [ ] **Step 7: Verify frontend compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 8: Commit**

```bash
git add frontend/src/pages/Auth/LoginPage.tsx \
       frontend/src/pages/Auth/RegisterPage.tsx \
       frontend/src/components/common/ProtectedRoute.tsx \
       frontend/src/layouts/Header.tsx \
       frontend/src/App.tsx \
       frontend/src/pages/index.ts
git commit -m "feat(security): add login page, wire register page, auth-aware header and protected routes"
```

---

### Task 8: Backend Security Tests

**Files:**
- Create: `backend/src/test/java/com/gathercart/security/AuthControllerTest.java`
- Create: `backend/src/test/java/com/gathercart/security/JwtServiceTest.java`
- Modify: `backend/src/test/java/com/gathercart/controller/CartControllerTest.java` (update for auth)

**Interfaces:**
- Consumes: All security components from Tasks 2–5. `@SpringBootTest`, `MockMvc`, `@WithMockUser`.
- Produces: Tests for: registration (happy + duplicate), login (happy + invalid creds), /me endpoint, JWT generation/validation/expiry, cart access with auth, admin role restriction, cross-user access denial.

- [ ] **Step 1: Create JwtServiceTest**

Create `backend/src/test/java/com/gathercart/security/JwtServiceTest.java`:

```java
package com.gathercart.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(
                "test-secret-key-that-is-at-least-256-bits-long-for-hs256-testing",
                3600000 // 1 hour
        );
    }

    @Test
    void generateToken_andExtractSubject_shouldMatch() {
        String token = jwtService.generateToken("test@example.com");
        String subject = jwtService.extractSubject(token);
        assertEquals("test@example.com", subject);
    }

    @Test
    void generateToken_withClaims_shouldBeValid() {
        UserDetails userDetails = new User("test@example.com", "hash",
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")));

        String token = jwtService.generateToken(
                Map.of("userId", 1L, "role", "CUSTOMER"),
                "test@example.com"
        );

        assertTrue(jwtService.isTokenValid(token, userDetails));
    }

    @Test
    void isTokenValid_withWrongUser_shouldReturnFalse() {
        String token = jwtService.generateToken("test@example.com");
        UserDetails other = new User("other@example.com", "hash",
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")));

        assertFalse(jwtService.isTokenValid(token, other));
    }

    @Test
    void isTokenValid_withExpiredToken_shouldReturnFalse() {
        JwtService shortLived = new JwtService(
                "test-secret-key-that-is-at-least-256-bits-long-for-hs256-testing",
                -1000 // Already expired
        );
        String token = shortLived.generateToken("test@example.com");
        UserDetails userDetails = new User("test@example.com", "hash",
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")));

        assertFalse(shortLived.isTokenValid(token, userDetails));
    }

    @Test
    void isTokenValid_withMalformedToken_shouldReturnFalse() {
        UserDetails userDetails = new User("test@example.com", "hash",
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")));

        assertFalse(jwtService.isTokenValid("not-a-valid-jwt", userDetails));
    }
}
```

- [ ] **Step 2: Run JwtServiceTest**

Run: `cd backend && mvnw.cmd test -Dtest=JwtServiceTest -pl . -Dspring.profiles.active=test`
Expected: All 5 tests PASS

- [ ] **Step 3: Create AuthControllerTest**

Create `backend/src/test/java/com/gathercart/security/AuthControllerTest.java`:

```java
package com.gathercart.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gathercart.dto.LoginRequest;
import com.gathercart.dto.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void register_withValidData_shouldReturn201() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .fullName("Test User")
                .phone("+919000000001")
                .email("testuser@example.com")
                .password("password123")
                .clusterId(1L)
                .agreedToTerms(true)
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("testuser@example.com"))
                .andExpect(jsonPath("$.data.token").isNotEmpty());
    }

    @Test
    void register_withDuplicateEmail_shouldReturn409() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .fullName("Test User")
                .phone("+919000000002")
                .email("duplicate@example.com")
                .password("password123")
                .agreedToTerms(true)
                .build();

        // First registration
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Second registration with same email
        request.setPhone("+919000000003");
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    void login_withValidCredentials_shouldReturn200() throws Exception {
        // Register first
        RegisterRequest regReq = RegisterRequest.builder()
                .fullName("Login User")
                .phone("+919000000004")
                .email("loginuser@example.com")
                .password("password123")
                .agreedToTerms(true)
                .build();
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regReq)));

        // Login
        LoginRequest loginReq = LoginRequest.builder()
                .email("loginuser@example.com")
                .password("password123")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.fullName").value("Login User"));
    }

    @Test
    void login_withInvalidPassword_shouldReturn401() throws Exception {
        // Register first
        RegisterRequest regReq = RegisterRequest.builder()
                .fullName("Bad Login")
                .phone("+919000000005")
                .email("badlogin@example.com")
                .password("password123")
                .agreedToTerms(true)
                .build();
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regReq)));

        LoginRequest loginReq = LoginRequest.builder()
                .email("badlogin@example.com")
                .password("wrongpassword")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void me_withoutToken_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void me_withValidToken_shouldReturnProfile() throws Exception {
        // Register
        RegisterRequest regReq = RegisterRequest.builder()
                .fullName("Me User")
                .phone("+919000000006")
                .email("meuser@example.com")
                .password("password123")
                .agreedToTerms(true)
                .build();
        MvcResult regResult = mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regReq)))
                .andReturn();

        String token = objectMapper.readTree(regResult.getResponse().getContentAsString())
                .at("/data/token").asText();

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("meuser@example.com"))
                .andExpect(jsonPath("$.data.fullName").value("Me User"));
    }

    @Test
    void adminEndpoint_withCustomerRole_shouldReturn403() throws Exception {
        // Register as customer
        RegisterRequest regReq = RegisterRequest.builder()
                .fullName("Customer User")
                .phone("+919000000007")
                .email("customer@example.com")
                .password("password123")
                .agreedToTerms(true)
                .build();
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regReq)))
                .andReturn();

        String token = objectMapper.readTree(result.getResponse().getContentAsString())
                .at("/data/token").asText();

        // Try accessing admin endpoint
        mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"test\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void cart_withoutAuth_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/cart"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void publicEndpoints_shouldBeAccessibleWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/categories"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/products"))
                .andExpect(status().isOk());
    }
}
```

- [ ] **Step 4: Run all tests**

Run: `cd backend && mvnw.cmd test -Dspring.profiles.active=test`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/test/java/com/gathercart/security/
git commit -m "test(security): add auth controller and JWT service tests"
```

---

### Task 9: Security Documentation

**Files:**
- Create: `docs/SECURITY_ARCHITECTURE.md`

**Interfaces:**
- Consumes: Knowledge of all security decisions from Tasks 1–8.
- Produces: Comprehensive markdown documentation of auth architecture, configuration, token strategy, and CORS setup.

- [ ] **Step 1: Write security architecture document**

Create `docs/SECURITY_ARCHITECTURE.md` covering:
- Authentication flow (register → JWT → bearer header)
- JWT token strategy (HMAC-SHA256, 24h expiry, claims include userId and role)
- Token storage (sessionStorage for refresh resilience, in-memory for axios interceptor)
- Password hashing (BCrypt via Spring Security)
- Authorization model (CUSTOMER vs ADMIN roles)
- Endpoint security matrix (public vs authenticated vs admin)
- CORS configuration
- Frontend security (ProtectedRoute, auth context, 401 interception)
- Security headers and best practices

- [ ] **Step 2: Commit**

```bash
git add docs/SECURITY_ARCHITECTURE.md
git commit -m "docs: add security architecture documentation for Phase 7"
```

---

### Task 10: Final Integration Verification

**Files:**
- Modify: `backend/src/main/java/com/gathercart/config/DataInitializer.java` (seed an admin user for testing)

**Interfaces:**
- Consumes: All prior tasks.
- Produces: Seeded admin user. Full end-to-end verification that app starts, all endpoints work correctly with auth.

- [ ] **Step 1: Update DataInitializer to seed an admin user**

Add to DataInitializer to create a test admin user (if not already present) on startup:

```java
// In the existing DataInitializer class, inject UserRepository and PasswordEncoder
// Then add admin user seeding:
if (!userRepository.existsByEmail("admin@gathercart.com")) {
    User admin = User.builder()
            .fullName("GatherCart Admin")
            .email("admin@gathercart.com")
            .phone("+910000000000")
            .passwordHash(passwordEncoder.encode("admin123"))
            .role(UserRole.ADMIN)
            .clusterId(1L)
            .isActive(true)
            .penaltyCount(0)
            .build();
    userRepository.save(admin);
    log.info("Seeded admin user: admin@gathercart.com");
}
```

- [ ] **Step 2: Build and verify backend starts**

Run: `cd backend && mvnw.cmd spring-boot:run`
Expected: Application starts on port 8081, Hibernate creates/updates `app_user` table, admin user is seeded.

- [ ] **Step 3: Verify frontend compiles and starts**

Run: `cd frontend && npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Run all backend tests**

Run: `cd backend && mvnw.cmd test -Dspring.profiles.active=test`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(security): Phase 7 complete — authentication, authorization, and security integration"
```

