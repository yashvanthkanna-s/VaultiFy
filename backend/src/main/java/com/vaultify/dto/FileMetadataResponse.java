package com.vaultify.dto;

import com.vaultify.model.FileMetadata;
import java.time.LocalDateTime;

/**
 * Public representation of a file record.
 * Exposes only what the frontend needs — no storage paths.
 */
public class FileMetadataResponse {

    private String id;
    private String fileName;
    private long fileSize;
    private String fileType;
    private LocalDateTime uploadedAt;

    public FileMetadataResponse() {}

    /** Build from a FileMetadata entity. */
    public FileMetadataResponse(FileMetadata entity) {
        this.id = entity.getId();
        this.fileName = entity.getFileName();
        this.fileSize = entity.getFileSize();
        this.fileType = entity.getFileType();
        this.uploadedAt = entity.getUploadedAt();
    }

    // ========== Getters & Setters ==========

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public long getFileSize() { return fileSize; }
    public void setFileSize(long fileSize) { this.fileSize = fileSize; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
