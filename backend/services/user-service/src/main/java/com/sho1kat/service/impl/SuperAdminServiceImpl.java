package com.sho1kat.service.impl;

import com.sho1kat.client.NotificationMailClient;
import com.sho1kat.dto.userServiceDto.request.CreateAdminRequest;
import com.sho1kat.dto.userServiceDto.request.UpdateUserStatusRequest;
import com.sho1kat.dto.userServiceDto.response.UserResponse;
import com.sho1kat.entity.User;
import com.sho1kat.enums.UserRole;
import com.sho1kat.enums.UserStatus;
import com.sho1kat.exception.ApiException;
import com.sho1kat.mapper.UserMapper;
import com.sho1kat.repository.RefreshTokenRepository;
import com.sho1kat.repository.UserRepository;
import com.sho1kat.service.SuperAdminService;
import com.sho1kat.service.UserService;
import com.sho1kat.util.PasswordGenerator;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SuperAdminServiceImpl implements SuperAdminService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserMapper userMapper;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final NotificationMailClient notificationMailClient;

    @Override
    public UserResponse createAdmin(CreateAdminRequest request) {
        String email = request.email().trim();
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw ApiException.conflict("User with email " + email + " already exists");
        }

        // Mail goes first: a mail outage must not strand an admin with an unknown password
        String generatedPassword = PasswordGenerator.generate();
        sendAdminCredentials(email, request.firstName(), generatedPassword);

        User saved = userRepository.save(User.builder()
                .firstName(request.firstName().trim())
                .middleName(trimToNull(request.middleName()))
                .lastName(request.lastName().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(generatedPassword))
                .phoneNumber(trimToNull(request.phoneNumber()))
                .status(UserStatus.ACTIVE)
                .userRole(UserRole.ROLE_ADMIN)
                .build());
        log.info("Admin account {} created (password generated and mailed)", email);
        return userMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public UserResponse changeAdminStatus(Long adminId, UpdateUserStatusRequest request) {
        requireAdminTarget(adminId);
        // suspendedAt stamping and session revocation are reused from UserService
        return userService.updateUserStatus(adminId, request);
    }

    @Override
    @Transactional
    public UserResponse resetAdminPassword(Long adminId) {
        User admin = requireAdminTarget(adminId);

        // Mail goes first: the old password must stay valid until delivery succeeds
        String generatedPassword = PasswordGenerator.generate();
        sendAdminCredentials(admin.getEmail(), admin.getFirstName(), generatedPassword);

        admin.setPasswordHash(passwordEncoder.encode(generatedPassword));
        refreshTokenRepository.revokeAllByUserId(adminId); // sessions under the old password die
        return userMapper.toResponse(userRepository.save(admin));
    }

    @Override
    @Transactional
    public void deleteAdmin(Long adminId) {
        requireAdminTarget(adminId);
        // soft delete + session revocation are reused from UserService (it also
        // refuses super admins, so a super admin can never fall through here)
        userService.deleteUser(adminId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllAdmins(int page, int size) {
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.clamp(size, 1, 100),
                Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id")));
        return userService.getAllUsers(UserRole.ROLE_ADMIN, pageable);
    }

    // ---- helpers ----

    /** Only ROLE_ADMIN accounts are manageable here — super admins manage no peers. */
    private User requireAdminTarget(Long adminId) {
        User user = userRepository.findById(adminId)
                .filter(u -> u.getStatus() != UserStatus.DELETED)
                .orElseThrow(() -> ApiException.notFound("User not found with id: " + adminId));
        if (user.getUserRole() != UserRole.ROLE_ADMIN) {
            throw ApiException.forbidden("Only ROLE_ADMIN accounts are managed here");
        }
        return user;
    }

    private void sendAdminCredentials(String email, String firstName, String generatedPassword) {
        String subject = "Your Job Portal admin account is ready";
        String body = """
                Hello %s,

                An administrator account has been created for you.

                Login email: %s
                Temporary password: %s

                Please log in and change this password immediately.

                — Job Portal System
                """.formatted(firstName, email, generatedPassword);
        try {
            notificationMailClient.sendMail(email, subject, body);
        } catch (FeignException e) {
            log.error("Mail delivery failed for admin bootstrap to {}: {}", email, e.getMessage());
            throw ApiException.serviceUnavailable(
                    "Mail service is unavailable; the admin credentials could not be delivered. Please retry.");
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
