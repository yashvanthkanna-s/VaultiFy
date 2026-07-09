package com.vaultify.service;

import com.vaultify.dto.FileMetadataResponse;
import com.vaultify.exception.VaultifyException;
import com.vaultify.model.FileMetadata;
import com.vaultify.model.User;
import com.vaultify.repository.FileRepository;
import com.vaultify.repository.UserRepository;
import com.vaultify.storage.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Handles all file-related operations: upload, list, download, delete.
 */
@Service
public class FileService {

    // ========== Validation Constants ==========

    /** Allowed file extensions (lowercase). */
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "pdf", "docx", "zip", "png", "jpg", "jpeg"
    );

    /** Maximum file size: 50 MB */
    private static final long MAX_FILE_SIZE = 50L * 1024 * 1024;

    /** Maximum storage per user: 500 MB */
    private static final long MAX_STORAGE_PER_USER = 500L * 1024 * 1024;

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StorageService storageService;

    // =============================================
    // Upload
    // =============================================

    /**
     * Validate and upload a file for the given user.
     * Checks: file not empty, correct type, within size limits, within storage quota.
     */
    public FileMetadataResponse upload(String userId, MultipartFile file) throws IOException {
        User user = getUser(userId);

        // Validate file is not empty
        if (file.isEmpty()) {
            throw new VaultifyException("Please select a file to upload", HttpStatus.BAD_REQUEST);
        }

        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new VaultifyException(
                    "File is too large. Maximum allowed size is 50 MB",
                    HttpStatus.PAYLOAD_TOO_LARGE
            );
        }

        // Validate original filename
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new VaultifyException("Invalid file name", HttpStatus.BAD_REQUEST);
        }

        // Validate extension
        String extension = extractExtension(originalFilename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new VaultifyException(
                    "File type not supported. Allowed types: PDF, DOCX, ZIP, PNG, JPG, JPEG",
                    HttpStatus.UNSUPPORTED_MEDIA_TYPE
            );
        }

        // Validate user storage quota
        if (user.getStorageUsed() + file.getSize() > MAX_STORAGE_PER_USER) {
            throw new VaultifyException(
                    "Storage limit exceeded. You have used " + formatBytes(user.getStorageUsed()) +
                    " of your 500 MB quota",
                    HttpStatus.INSUFFICIENT_STORAGE
            );
        }

        // Generate a unique storage key (UUID + extension)
        String storageKey = UUID.randomUUID() + "." + extension;

        // Store the actual file
        storageService.store(file, storageKey);

        // Save metadata to database
        FileMetadata metadata = new FileMetadata();
        metadata.setUserId(userId);
        metadata.setFileName(originalFilename);
        metadata.setFileSize(file.getSize());
        metadata.setFileType(extension.toUpperCase());
        metadata.setStoragePath(storageKey);
        metadata = fileRepository.save(metadata);

        // Update user storage usage
        user.setStorageUsed(user.getStorageUsed() + file.getSize());
        userRepository.save(user);

        return new FileMetadataResponse(metadata);
    }

    // =============================================
    // List Files
    // =============================================

    /** Returns all files owned by the user, newest first. */
    public List<FileMetadataResponse> listFiles(String userId) {
        return fileRepository.findByUserIdOrderByUploadedAtDesc(userId)
                .stream()
                .map(FileMetadataResponse::new)
                .collect(Collectors.toList());
    }

    // =============================================
    // Download
    // =============================================

    /** Load the file Resource for download. Verifies ownership. */
    public Resource download(String userId, String fileId) {
        FileMetadata metadata = getFileForUser(userId, fileId);
        return storageService.load(metadata.getStoragePath());
    }

    /** Get the original filename for the Content-Disposition header. */
    public String getFileName(String userId, String fileId) {
        return getFileForUser(userId, fileId).getFileName();
    }

    // =============================================
    // Delete
    // =============================================

    /**
     * Delete a file and update the user's storage counter.
     * Verifies the file belongs to the requesting user.
     */
    public void delete(String userId, String fileId) {
        FileMetadata metadata = getFileForUser(userId, fileId);

        // Delete from storage
        storageService.delete(metadata.getStoragePath());

        // Remove metadata from database
        fileRepository.delete(metadata);

        // Reduce user storage usage
        User user = getUser(userId);
        long newStorage = Math.max(0, user.getStorageUsed() - metadata.getFileSize());
        user.setStorageUsed(newStorage);
        userRepository.save(user);
    }

    // =============================================
    // Private Helpers
    // =============================================

    private User getUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new VaultifyException("User not found", HttpStatus.NOT_FOUND));
    }

    private FileMetadata getFileForUser(String userId, String fileId) {
        FileMetadata metadata = fileRepository.findById(fileId)
                .orElseThrow(() -> new VaultifyException("File not found", HttpStatus.NOT_FOUND));

        if (!metadata.getUserId().equals(userId)) {
            throw new VaultifyException("Access denied", HttpStatus.FORBIDDEN);
        }

        return metadata;
    }

    private String extractExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == filename.length() - 1) {
            return "";
        }
        return filename.substring(dotIndex + 1);
    }

    private String formatBytes(long bytes) {
        if (bytes >= 1024 * 1024) {
            return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
        } else if (bytes >= 1024) {
            return String.format("%.1f KB", bytes / 1024.0);
        }
        return bytes + " B";
    }
}
