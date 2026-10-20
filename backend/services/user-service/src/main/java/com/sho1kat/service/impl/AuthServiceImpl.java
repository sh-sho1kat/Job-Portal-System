package com.sho1kat.service.impl;

import com.sho1kat.dto.user_service.request.ChangePasswordRequest;
import com.sho1kat.dto.user_service.request.LoginRequest;
import com.sho1kat.dto.user_service.request.RefreshTokenRequest;
import com.sho1kat.dto.user_service.request.RegisterRequest;
import com.sho1kat.dto.user_service.response.AuthResponse;
import com.sho1kat.dto.user_service.response.UserResponse;
import com.sho1kat.entity.RefreshToken;
import com.sho1kat.entity.User;
import com.sho1kat.enums.UserRole;
import com.sho1kat.enums.UserStatus;
import com.sho1kat.exception.ApiException;
import com.sho1kat.mapper.UserMapper;
import com.sho1kat.repository.RefreshTokenRepository;
import com.sho1kat.repository.UserRepository;
import com.sho1kat.security.JwtService;
import com.sho1kat.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Set;


@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    // computed once: a valid-format bcrypt hash of a known value, used only to burn the
    // same BCrypt cost for unknown emails so response timing cannot enumerate accounts
    private static final String DUMMY_HASH = new BCryptPasswordEncoder().encode("timing-equalizer");

    // roles a user may self-select; privileged roles can only be granted by an admin
    private static final Set<UserRole> SELF_REGISTRABLE_ROLES =
            Set.of(UserRole.ROLE_JOB_SEEKER, UserRole.ROLE_EMPLOYER);

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (!SELF_REGISTRABLE_ROLES.contains(request.userRole())) {
            throw ApiException.forbidden("This role cannot be assigned during registration");
        }
        if (userRepository.existsByEmailIgnoreCase(request.email().trim())) {
            throw ApiException.conflict("Email is already registered");
        }

        User user = userMapper.toEntity(request, passwordEncoder.encode(request.password()));
        User saved = userRepository.save(user);
        log.info("User created: id={}, role={}", saved.getId(), saved.getUserRole());
        return userMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        // same error for unknown email and wrong password, so accounts cannot be enumerated
        User user = userRepository.findByEmailIgnoreCase(request.email().trim()).orElse(null);

        if (user == null) {
            passwordEncoder.matches(request.password(), DUMMY_HASH); // keeps timing identical to a failed login
            throw unauthorized("Invalid email or password");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw unauthorized("Invalid email or password");
        }

        assertAccountUsable(user);

        user.setLastLoginAt(Instant.now());
        log.info("User logged in: id={}", user.getId());
        return buildAuthResponse(user);
    }

    // noRollbackFor: the "revoke all sessions" update below must survive the exception we throw after it
    @Override
    @Transactional(noRollbackFor = ApiException.class)
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken stored = refreshTokenRepository.findByTokenHash(sha256(request.refreshToken()))
                .orElseThrow(() -> unauthorized("Invalid refresh token"));

        User user = stored.getUser();

        if (stored.isRevoked()) {
            // an already-rotated token was presented again: assume it leaked and end every session
            refreshTokenRepository.revokeAllByUserId(user.getId());
            log.warn("Revoked refresh token reused, all sessions revoked: userId={}", user.getId());
            throw unauthorized("Refresh token has been revoked");
        }
        if (stored.getExpiresAt().isBefore(Instant.now())) {
            throw unauthorized("Refresh token has expired");
        }

        assertAccountUsable(user);

        stored.setRevoked(true); // rotation: each refresh token works once
        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public void logout(RefreshTokenRequest request) {
        // idempotent: unknown or already revoked tokens are simply ignored
        refreshTokenRepository.findByTokenHash(sha256(request.refreshToken()))
                .ifPresent(token -> token.setRevoked(true));
    }

    @Override
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .filter(u -> u.getStatus() != UserStatus.DELETED)
                .orElseThrow(() -> ApiException.notFound("User not found"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw ApiException.badRequest("Current password is incorrect");
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw ApiException.badRequest("New password must be different from the current password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        refreshTokenRepository.revokeAllByUserId(userId); // force re-login on every device
        log.info("Password changed: id={}", userId);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = createRefreshToken(user);
        return new AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                jwtService.getAccessTokenTtlSeconds(),
                userMapper.toResponse(user)
        );
    }

    private String createRefreshToken(User user) {
        byte[] bytes = new byte[48];
        SECURE_RANDOM.nextBytes(bytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        refreshTokenRepository.save(RefreshToken.builder()
                .tokenHash(sha256(rawToken))
                .user(user)
                .expiresAt(Instant.now().plus(jwtService.getRefreshTokenTtl()))
                .revoked(false)
                .build());

        return rawToken; // only the hash is stored; the raw value is shown to the client once
    }

    private void assertAccountUsable(User user) {
        if (user.getStatus() == UserStatus.DELETED) {
            throw unauthorized("Invalid credentials");
        }
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw ApiException.forbidden("Account is " + user.getStatus().name().toLowerCase());
        }
    }

    private ApiException unauthorized(String message) {
        return ApiException.unauthorized(message);
    }

    private static String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}