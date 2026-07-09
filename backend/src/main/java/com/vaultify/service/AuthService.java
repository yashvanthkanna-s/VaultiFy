package com.vaultify.service;

import com.vaultify.config.JwtUtil;
import com.vaultify.dto.AuthResponse;
import com.vaultify.dto.LoginRequest;
import com.vaultify.dto.SignupRequest;
import com.vaultify.dto.UserProfileResponse;
import com.vaultify.exception.VaultifyException;
import com.vaultify.model.User;
import com.vaultify.repository.FileRepository;
import com.vaultify.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Handles all authentication and user profile operations.
 */
@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Register a new user.
     * Validates that passwords match and email is unique,
     * then saves the user with a BCrypt-hashed password.
     */
    public AuthResponse register(SignupRequest request) {
        // Validate passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new VaultifyException("Passwords do not match", HttpStatus.BAD_REQUEST);
        }

        // Check email uniqueness
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new VaultifyException("An account with this email already exists", HttpStatus.CONFLICT);
        }

        // Build and save new user
        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setStorageUsed(0);

        user = userRepository.save(user);

        // Generate JWT
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());

        return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail());
    }

    /**
     * Log in an existing user.
     * Verifies email and password, then returns a JWT token.
     */
    public AuthResponse login(LoginRequest request) {
        // Find user by email
        User user = userRepository
                .findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new VaultifyException("Invalid email or password", HttpStatus.UNAUTHORIZED));

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new VaultifyException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        // Generate JWT
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());

        return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail());
    }

    /**
     * Get the current user's profile data including storage usage and file count.
     */
    public UserProfileResponse getCurrentUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new VaultifyException("User not found", HttpStatus.NOT_FOUND));

        int totalFiles = fileRepository.countByUserId(userId);

        return new UserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getStorageUsed(),
                totalFiles,
                user.getCreatedAt()
        );
    }
}
