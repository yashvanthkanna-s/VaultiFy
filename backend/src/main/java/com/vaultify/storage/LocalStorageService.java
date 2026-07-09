package com.vaultify.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;

/**
 * Local filesystem implementation of StorageService.
 *
 * Saves files to a local directory (./uploads by default).
 * To switch to Amazon S3, create S3StorageService and mark it @Primary.
 * No changes needed in FileService or FileController.
 */
@Service
public class LocalStorageService implements StorageService {

    /** Storage directory path, configurable via application.properties */
    @Value("${vaultify.storage.location}")
    private String storageLocation;

    /**
     * Saves the file to the local uploads directory.
     * Creates the directory if it does not exist.
     */
    @Override
    public String store(MultipartFile file, String storageKey) throws IOException {
        Path uploadDir = Paths.get(storageLocation).toAbsolutePath().normalize();
        Files.createDirectories(uploadDir);

        Path targetPath = uploadDir.resolve(storageKey);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        return storageKey;
    }

    /**
     * Loads the file as a Spring Resource.
     * Returns the file so Spring MVC can stream it to the client.
     */
    @Override
    public Resource load(String storageKey) {
        try {
            Path filePath = Paths.get(storageLocation).toAbsolutePath().normalize().resolve(storageKey);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            }

            throw new RuntimeException("File not found or not readable: " + storageKey);
        } catch (MalformedURLException e) {
            throw new RuntimeException("Could not resolve file path: " + storageKey, e);
        }
    }

    /**
     * Deletes the file from the local filesystem.
     * Silently ignores if the file does not exist.
     */
    @Override
    public void delete(String storageKey) {
        try {
            Path filePath = Paths.get(storageLocation).toAbsolutePath().normalize().resolve(storageKey);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Could not delete file: " + storageKey, e);
        }
    }
}
