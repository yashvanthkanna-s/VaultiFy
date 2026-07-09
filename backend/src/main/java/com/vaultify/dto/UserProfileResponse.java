package com.vaultify.dto;

import java.time.LocalDateTime;

/**
 * Response for GET /api/auth/me — the user's profile data.
 */
public class UserProfileResponse {

    private String id;
    private String fullName;
    private String email;
    private long storageUsed;
    private int totalFiles;
    private LocalDateTime createdAt;

    public UserProfileResponse() {}

    public UserProfileResponse(String id, String fullName, String email,
                               long storageUsed, int totalFiles, LocalDateTime createdAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.storageUsed = storageUsed;
        this.totalFiles = totalFiles;
        this.createdAt = createdAt;
    }

    // ========== Getters & Setters ==========

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public long getStorageUsed() { return storageUsed; }
    public void setStorageUsed(long storageUsed) { this.storageUsed = storageUsed; }

    public int getTotalFiles() { return totalFiles; }
    public void setTotalFiles(int totalFiles) { this.totalFiles = totalFiles; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
