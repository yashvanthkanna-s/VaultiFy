package com.vaultify.repository;

import com.vaultify.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for User entities.
 *
 * Currently backed by Spring Data JPA + H2 database.
 * Future: Replace with a DynamoDB-backed implementation
 * by creating a DynamoDBUserRepository that implements the same interface.
 */
@Repository
public interface UserRepository extends JpaRepository<User, String> {

    /** Find user by email (used for login and uniqueness check). */
    Optional<User> findByEmail(String email);

    /** Check if an email is already registered. */
    boolean existsByEmail(String email);
}
