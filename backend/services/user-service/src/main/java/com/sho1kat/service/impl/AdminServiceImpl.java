package com.sho1kat.service.impl;

import com.sho1kat.client.NotificationMailClient;
import com.sho1kat.dto.userServiceDto.request.UpdateUserStatusRequest;
import com.sho1kat.dto.userServiceDto.response.UserResponse;
import com.sho1kat.entity.User;
import com.sho1kat.enums.UserRole;
import com.sho1kat.enums.UserStatus;
import com.sho1kat.exception.ApiException;
import com.sho1kat.mapper.UserMapper;
import com.sho1kat.repository.RefreshTokenRepository;
import com.sho1kat.repository.UserRepository;
import com.sho1kat.service.AdminService;
import com.sho1kat.service.UserService;
import com.sho1kat.util.PasswordGenerator;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserMapper userMapper;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final NotificationMailClient notificationMailClient;

    @Override
    @Transactional
    public UserResponse resetUserPassword(Long userId) {
        User user = requireNonAdminUser(userId);
        String generatedPassword = PasswordGenerator.generate();

        // Mail goes first: the old password must stay valid until delivery succeeds
        String subject = "Your Job Portal password has been reset";
        String body = """
                Hello %s,

                Your password has been reset by an administrator.

                Login email: %s
                Temporary password: %s

                Please log in and change this password immediately.

                — Job Portal System
                """.formatted(user.getFirstName(), user.getEmail(), generatedPassword);
        sendMailOrUnavailable(user.getEmail(), subject, body);

        user.setPasswordHash(passwordEncoder.encode(generatedPassword));
        // sessions minted under the old password die with the reset
        refreshTokenRepository.revokeAllByUserId(userId);
        return userMapper.toResponse(userRepository.save(user));
    }

    private void sendMailOrUnavailable(String to, String subject, String body) {
        try {
            notificationMailClient.sendMail(to, subject, body);
        } catch (FeignException e) {
            throw ApiException.serviceUnavailable(
                    "Mail service is unavailable; the new password could not be delivered. Please retry.");
        }
    }

    @Override
    @Transactional
    public UserResponse changeUserStatus(Long userId, UpdateUserStatusRequest request) {
        requireNonAdminUser(userId);
        // suspendedAt stamping and session revocation are reused from UserService
        return userService.updateUserStatus(userId, request);
    }

    // ---- helpers ----

    private User requireNonAdminUser(Long userId) {
        User user = userRepository.findById(userId)
                .filter(u -> u.getStatus() != UserStatus.DELETED)
                .orElseThrow(() -> ApiException.notFound("User not found with id: " + userId));
        if (user.getUserRole() == UserRole.ROLE_ADMIN || user.getUserRole() == UserRole.ROLE_SUPER_ADMIN) {
            throw ApiException.forbidden("Admin accounts are managed by super admins only");
        }
        return user;
    }
}
