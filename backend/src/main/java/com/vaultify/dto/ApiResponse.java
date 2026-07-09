package com.vaultify.dto;

/**
 * Generic API response wrapper used for all endpoints.
 * Provides a consistent JSON structure: { success, message, data }
 *
 * @param <T> the type of the data payload
 */
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;

    private ApiResponse() {}

    // ========== Static Factory Methods ==========

    public static <T> ApiResponse<T> success(String message, T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.success = true;
        response.message = message;
        response.data = data;
        return response;
    }

    public static <T> ApiResponse<T> error(String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.success = false;
        response.message = message;
        response.data = null;
        return response;
    }

    // ========== Getters ==========

    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public T getData() { return data; }
}
