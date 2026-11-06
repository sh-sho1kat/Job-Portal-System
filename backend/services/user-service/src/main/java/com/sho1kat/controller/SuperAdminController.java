package com.sho1kat.controller;

import com.sho1kat.dto.userServiceDto.request.CreateAdminRequest;
import com.sho1kat.dto.userServiceDto.request.UpdateUserStatusRequest;
import com.sho1kat.dto.userServiceDto.response.UserResponse;
import com.sho1kat.service.SuperAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/super")
@RequiredArgsConstructor
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    @PostMapping("/admins")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<UserResponse> createAdmin(
            @Valid @RequestBody CreateAdminRequest request) {
        return ResponseEntity.ok(superAdminService.createAdmin(request));
    }

    @PatchMapping("/admins/{adminId}/status")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<UserResponse> changeAdminStatus(
            @PathVariable Long adminId,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        return ResponseEntity.ok(superAdminService.changeAdminStatus(adminId, request));
    }

    @PostMapping("/admins/{adminId}/password-reset")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<UserResponse> resetAdminPassword(
            @PathVariable Long adminId) {
        return ResponseEntity.ok(superAdminService.resetAdminPassword(adminId));
    }

    @DeleteMapping("/admins/{adminId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteAdmin(
            @PathVariable Long adminId) {
        superAdminService.deleteAdmin(adminId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admins")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Page<UserResponse>> getAllAdmins(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(superAdminService.getAllAdmins(page, size));
    }
}
