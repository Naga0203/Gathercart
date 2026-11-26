package com.gathercart.service;

import com.gathercart.dto.AuthResponse;
import com.gathercart.dto.LoginRequest;
import com.gathercart.dto.RegisterRequest;
import com.gathercart.dto.UpdateProfileRequest;
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

        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }
        if (userRepository.existsByPhone(request.getPhone().trim())) {
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

        return toProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Check phone uniqueness if changed
        String newPhone = request.getPhone().trim();
        if (!newPhone.equals(user.getPhone()) && userRepository.existsByPhone(newPhone)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone number is already registered");
        }

        user.setFullName(request.getFullName().trim());
        user.setPhone(newPhone);
        user = userRepository.save(user);
        log.info("Updated profile for user: {} (ID: {})", user.getEmail(), user.getId());

        return toProfileResponse(user);
    }

    private UserProfileResponse toProfileResponse(User user) {
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

