package com.sho1kat.controller;

import com.sho1kat.dto.userServiceDto.request.UpdateUserStatusRequest;
import com.sho1kat.dto.userServiceDto.response.UserResponse;
import com.sho1kat.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/{userId}/password")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<UserResponse> resetUserPassword(
            @PathVariable Long userId,
            @Valid @RequestBody ResetUserPasswordRequest request) {
        return ResponseEntity.ok(adminService.resetUserPassword(userId, request));
    }

    @PatchMapping("/{userId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<UserResponse> changeUserStatus(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        return ResponseEntity.ok(adminService.changeUserStatus(userId, request));
    }
}
