package com.sho1kat.service;

import com.sho1kat.dto.user_service.request.UpdateUserRequest;
import com.sho1kat.dto.user_service.request.UpdateUserStatusRequest;
import com.sho1kat.dto.user_service.response.UserResponse;
import com.sho1kat.entity.User;
import com.sho1kat.enums.UserRole;
import com.sho1kat.enums.UserStatus;
import com.sho1kat.exception.ApiException;
import com.sho1kat.mapper.UserMapper;
import com.sho1kat.repository.RefreshTokenRepository;
import com.sho1kat.repository.UserRepository;
import com.sho1kat.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final RefreshTokenRepository refreshTokenRepository;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return userMapper.toResponse(findActiveUserOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(UserRole userRole, Pageable pageable) {
        Page<User> page = (userRole == null)
                ? userRepository.findByStatusNot(UserStatus.DELETED, pageable)
                : userRepository.findByUserRoleAndStatusNot(userRole, UserStatus.DELETED, pageable);
        return page.map(userMapper::toResponse);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = findActiveUserOrThrow(id);
        userMapper.updateEntity(request, user);
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse updateUserStatus(Long id, UpdateUserStatusRequest request) {
        if (request.status() == UserStatus.DELETED) {
            throw ApiException.badRequest("Use the delete endpoint to delete a user");
        }

        User user = findActiveUserOrThrow(id);
        rejectIfSuperAdmin(user);

        user.setStatus(request.status());
        user.setSuspendedAt(request.status() == UserStatus.SUSPENDED ? Instant.now() : null);

        if (request.status() != UserStatus.ACTIVE) {
            refreshTokenRepository.revokeAllByUserId(id);
        }
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = findActiveUserOrThrow(id);
        rejectIfSuperAdmin(user);

        user.setStatus(UserStatus.DELETED);
        user.setDeletedAt(Instant.now());
        refreshTokenRepository.revokeAllByUserId(id); // a deleted account must not keep working sessions
        userRepository.save(user);
    }

    private User findActiveUserOrThrow(Long id) {
        return userRepository.findById(id)
                .filter(u -> u.getStatus() != UserStatus.DELETED)
                .orElseThrow(() -> ApiException.notFound("User not found with id: " + id));
    }

    private void rejectIfSuperAdmin(User user) {
        if (user.getUserRole() == UserRole.ROLE_SUPER_ADMIN) {
            throw ApiException.forbidden("Super admin accounts cannot be suspended or deleted");
        }
    }
}