package com.sho1kat.client;

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
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
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


@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private static final Set<UserRole> PERMITTED_ROLES = Set.of(UserRole.ROLE_JOB_SEEKER, UserRole.ROLE_EMPLOYER);

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        validateUser(request.email().trim());
        validateUserRole(request.userRole());

        User user = userMapper.toEntity(request, passwordEncoder.encode(request.password()));
        User saved = userRepository.save(user);

        return userMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {

        User user = authenticateUser(request.email(), request.password());
        user.setLastLoginAt(Instant.now());

        return buildAuthResponse(user);
    }

    private User authenticateUser(@NotBlank(message = "Email is required") @Email(message = "Email is not valid") String email, @NotBlank(message = "Password is required") String password) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> unauthorized("No User found with the provided email " + email));
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw unauthorized("Invalid email or password");
        }
        validateUserStatus(user);
        return user;
    }

    @Override
    @Transactional(noRollbackFor = ApiException.class)
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken stored = refreshTokenRepository.findByTokenHash(sha256(request.refreshToken()))
                .orElseThrow(() -> unauthorized("Invalid refresh token"));

        User user = stored.getUser();

        if (stored.isRevoked()) {
            refreshTokenRepository.revokeAllByUserId(user.getId());
            throw unauthorized("Refresh token has been revoked");
        }
        if (stored.getExpiresAt().isBefore(Instant.now())) {
            throw unauthorized("Refresh token has expired");
        }

        validateUserStatus(user);

        stored.setRevoked(true);
        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public void logout(RefreshTokenRequest request) {
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
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = createRefreshToken(user);
        return new AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                "Authentication successful",
                jwtService.getAccessTokenTtlSeconds(),
                userMapper.toResponse(user)
        );
    }

    private String createRefreshToken(User user) {
        byte[] bytes = new byte[48];
        SECURE_RANDOM.nextBytes(bytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        refreshTokenRepository.save(
                RefreshToken.builder()
                .tokenHash(sha256(rawToken))
                .user(user)
                .expiresAt(Instant.now().plus(jwtService.getRefreshTokenTtl()))
                .revoked(false)
                .build());

        return rawToken;
    }

    private void validateUserStatus(User user) {
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

    private void validateUserRole(@NotNull(message = "User role is required") UserRole userRole) {
        if (!PERMITTED_ROLES.contains(userRole)) {
            throw ApiException.forbidden("This role cannot be assigned during registration");
        }
    }

    private void validateUser(@NotNull(message = "Email is required") String email) {
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw ApiException.conflict("Email is already registered");
        }
    }
}