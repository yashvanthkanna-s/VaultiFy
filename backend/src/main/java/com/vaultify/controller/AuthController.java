package com.vaultify.controller;

import com.vaultify.dto.ApiResponse;
import com.vaultify.dto.AuthResponse;
import com.vaultify.dto.LoginRequest;
import com.vaultify.dto.SignupRequest;
import com.vaultify.dto.UserProfileResponse;
import com.vaultify.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication endpoints.
 *
 * Public routes:  POST /api/auth/signup, POST /api/auth/login
 * Protected route: GET /api/auth/me (requires valid JWT)
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    /** Register a new user account. */
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthResponse>> signup(
            @Valid @RequestBody SignupRequest request) {

        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Account created successfully", response));
    }

    /** Log in with email and password. Returns a JWT token. */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    /** Get the authenticated user's profile. Requires JWT. */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        UserProfileResponse profile = authService.getCurrentUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved", profile));
    }
}
