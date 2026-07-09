package com.vaultify.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Stores metadata for every uploaded file.
 * The actual file binary is managed by StorageService.
 *
 * Future: When migrating to DynamoDB, this class maps to a
 * DynamoDB table with `id` as partition key and `userId` as GSI.
 */
@Entity
@Table(name = "file_metadata")
public class FileMetadata {

    @Id
    private String id;

    /** The ID of the user who owns this file. */
    @Column(name = "user_id", nullable = false)
    private String userId;

    /** Original filename as uploaded by the user. */
    @Column(name = "file_name", nullable = false)
    private String fileName;

    /** File size in bytes. */
    @Column(name = "file_size", nullable = false)
    private long fileSize;

    /** File extension (PDF, PNG, JPG, etc.). */
    @Column(name = "file_type", nullable = false)
    private String fileType;

    /**
     * Unique key used to locate the file in storage.
     * For local storage: relative filename under /uploads/.
     * For S3: S3 object key.
     */
    @Column(name = "storage_path", nullable = false)
    private String storagePath;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        this.uploadedAt = LocalDateTime.now();
    }

    // ========== Getters & Setters ==========

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public long getFileSize() { return fileSize; }
    public void setFileSize(long fileSize) { this.fileSize = fileSize; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public String getStoragePath() { return storagePath; }
    public void setStoragePath(String storagePath) { this.storagePath = storagePath; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
