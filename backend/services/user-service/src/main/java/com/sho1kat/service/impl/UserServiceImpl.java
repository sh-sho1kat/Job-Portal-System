package com.sho1kat.service.impl;

import com.sho1kat.dto.user_service.request.RegisterRequest;
import com.sho1kat.dto.user_service.request.UpdateUserRequest;
import com.sho1kat.dto.user_service.request.UpdateUserStatusRequest;
import com.sho1kat.dto.user_service.response.UserResponse;
import com.sho1kat.entity.User;
import com.sho1kat.enums.UserRole;
import com.sho1kat.enums.UserStatus;
import com.sho1kat.mapper.UserMapper;
import com.sho1kat.repository.UserRepository;
import com.sho1kat.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private static final Set<UserRole> SELF_REGISTRABLE_ROLES =
            Set.of(UserRole.ROLE_JOB_SEEKER, UserRole.ROLE_EMPLOYER);

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponse createUser(RegisterRequest request) {
        if (!SELF_REGISTRABLE_ROLES.contains(request.userRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "This role cannot be assigned during registration");
        }
        if (userRepository.existsByEmailIgnoreCase(request.email().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Email is already registered");
        }

        User user = userMapper.toEntity(request, passwordEncoder.encode(request.password()));
        User saved = userRepository.save(user);
        log.info("User created: id={}, role={}", saved.getId(), saved.getUserRole());
        return userMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return userMapper.toResponse(findActiveUserOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmailIgnoreCase(email.trim())
                .filter(u -> u.getStatus() != UserStatus.DELETED)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "User not found with email: " + email));
        return userMapper.toResponse(user);
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
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Use the delete endpoint to delete a user");
        }

        User user = findActiveUserOrThrow(id);
        rejectIfSuperAdmin(user);

        user.setStatus(request.status());
        user.setSuspendedAt(request.status() == UserStatus.SUSPENDED ? Instant.now() : null);

        log.info("User status changed: id={}, status={}", id, request.status());
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = findActiveUserOrThrow(id);
        rejectIfSuperAdmin(user);

        user.setStatus(UserStatus.DELETED);
        user.setDeletedAt(Instant.now());
        userRepository.save(user);
        log.info("User soft-deleted: id={}", id);
    }

    @Override
    @Transactional
    public void updateLastLogin(Long id) {
        User user = findActiveUserOrThrow(id);
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);
    }

    private User findActiveUserOrThrow(Long id) {
        return userRepository.findById(id)
                .filter(u -> u.getStatus() != UserStatus.DELETED)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "User not found with id: " + id));
    }

    private void rejectIfSuperAdmin(User user) {
        if (user.getUserRole() == UserRole.ROLE_SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Super admin accounts cannot be suspended or deleted");
        }
    }
}