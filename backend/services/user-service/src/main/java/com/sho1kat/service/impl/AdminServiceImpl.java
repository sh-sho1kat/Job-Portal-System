package com.sho1kat.service.impl;

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

    @Override
    @Transactional
    public UserResponse resetUserPassword(Long userId, ResetUserPasswordRequest request) {
        User user = requireNonAdminUser(userId);
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        // sessions minted under the old password die with the reset
        refreshTokenRepository.revokeAllByUserId(userId);
        return userMapper.toResponse(userRepository.save(user));
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
