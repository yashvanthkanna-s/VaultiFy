package com.vaultify.dto;

/**
 * Response returned after successful signup or login.
 * Contains the JWT token and basic user info.
 */
public class AuthResponse {

    private String token;
    private String userId;
    private String fullName;
    private String email;

    public AuthResponse() {}

    public AuthResponse(String token, String userId, String fullName, String email) {
        this.token = token;
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
    }

    // ========== Getters & Setters ==========

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
