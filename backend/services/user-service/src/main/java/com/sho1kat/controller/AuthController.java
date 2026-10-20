package com.sho1kat.controller;

import com.sho1kat.dto.user_service.request.ChangePasswordRequest;
import com.sho1kat.dto.user_service.request.LoginRequest;
import com.sho1kat.dto.user_service.request.RefreshTokenRequest;
import com.sho1kat.dto.user_service.request.RegisterRequest;
import com.sho1kat.dto.user_service.response.AuthResponse;
import com.sho1kat.dto.user_service.response.UserResponse;
import com.sho1kat.security.AuthenticatedUser;
import com.sho1kat.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal AuthenticatedUser principal,
                                               @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(principal.id(), request);
        return ResponseEntity.noContent().build();
    }
}