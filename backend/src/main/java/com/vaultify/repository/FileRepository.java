package com.vaultify.repository;

import com.vaultify.model.FileMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for FileMetadata entities.
 *
 * Currently backed by Spring Data JPA + H2 database.
 * Future: Replace with a DynamoDB-backed implementation
 * that uses a GSI on `userId` for efficient queries.
 */
@Repository
public interface FileRepository extends JpaRepository<FileMetadata, String> {

    /** Get all files for a user, newest first. */
    List<FileMetadata> findByUserIdOrderByUploadedAtDesc(String userId);

    /** Count how many files a user has uploaded. */
    int countByUserId(String userId);
}
