package com.vaultify;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Vaultify — Secure. Store. Share.
 *
 * Main entry point for the Spring Boot application.
 * Version 1.0 — Local storage + H2 Database.
 * Future: AWS S3 + DynamoDB integration.
 */
@SpringBootApplication
public class VaultifyApplication {

    public static void main(String[] args) {
        SpringApplication.run(VaultifyApplication.class, args);
    }
}
