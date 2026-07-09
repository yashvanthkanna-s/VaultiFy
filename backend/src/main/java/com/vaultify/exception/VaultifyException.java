package com.vaultify.exception;

import org.springframework.http.HttpStatus;

/**
 * Custom exception for Vaultify business logic errors.
 * Carries an HTTP status so the GlobalExceptionHandler
 * can return the correct response code.
 */
public class VaultifyException extends RuntimeException {

    private final HttpStatus status;

    public VaultifyException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
