package com.vaultify.controller;

import com.vaultify.dto.ApiResponse;
import com.vaultify.dto.FileMetadataResponse;
import com.vaultify.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * REST controller for file operations.
 * All endpoints require a valid JWT token.
 *
 * POST   /api/files/upload      — Upload a file
 * GET    /api/files             — List all files
 * GET    /api/files/{id}/download — Download a file
 * DELETE /api/files/{id}        — Delete a file
 */
@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private FileService fileService;

    /** Upload a file (multipart/form-data with field name "file"). */
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<FileMetadataResponse>> upload(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {

        String userId = (String) authentication.getPrincipal();
        FileMetadataResponse response = fileService.upload(userId, file);
        return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", response));
    }

    /** List all files belonging to the authenticated user. */
    @GetMapping
    public ResponseEntity<ApiResponse<List<FileMetadataResponse>>> listFiles(Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        List<FileMetadataResponse> files = fileService.listFiles(userId);
        return ResponseEntity.ok(ApiResponse.success("Files retrieved", files));
    }

    /** Download a specific file by ID. */
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(
            @PathVariable String id,
            Authentication authentication) {

        String userId = (String) authentication.getPrincipal();
        Resource resource = fileService.download(userId, id);
        String fileName = fileService.getFileName(userId, id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(resource);
    }

    /** Delete a specific file by ID. */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable String id,
            Authentication authentication) {

        String userId = (String) authentication.getPrincipal();
        fileService.delete(userId, id);
        return ResponseEntity.ok(ApiResponse.success("File deleted successfully", null));
    }
}
