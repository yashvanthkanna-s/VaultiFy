package com.vaultify.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Abstraction layer for file storage.
 *
 * Current implementation: LocalStorageService (saves files to local disk)
 * Future implementation: S3StorageService (saves files to Amazon S3)
 *
 * To swap storage providers:
 *   1. Create a new class that implements this interface (e.g., S3StorageService)
 *   2. Annotate it with @Primary or use @Qualifier
 *   3. No changes needed in FileService or FileController
 */
public interface StorageService {

    /**
     * Store a file using the given unique storage key.
     *
     * @param file       the uploaded multipart file
     * @param storageKey unique key/filename to use for storage
     * @return the storage key used (same as input, or S3 URI in the future)
     * @throws IOException if file cannot be written
     */
    String store(MultipartFile file, String storageKey) throws IOException;

    /**
     * Load a file as a Spring Resource for download.
     *
     * @param storageKey the key returned from store()
     * @return a readable Resource
     */
    Resource load(String storageKey);

    /**
     * Delete a file from storage.
     *
     * @param storageKey the key returned from store()
     */
    void delete(String storageKey);
}
