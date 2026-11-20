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
