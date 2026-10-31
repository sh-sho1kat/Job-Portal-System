package com.sho1kat.client;

import com.sho1kat.dto.user_service.request.UpdateUserRequest;
import com.sho1kat.dto.user_service.request.UpdateUserStatusRequest;
import com.sho1kat.dto.user_service.response.UserResponse;
import com.sho1kat.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {

    UserResponse getUserById(Long id);

    Page<UserResponse> getAllUsers(UserRole userRole, Pageable pageable);

    UserResponse updateUser(Long id, UpdateUserRequest request);

    UserResponse updateUserStatus(Long id, UpdateUserStatusRequest request);

    void deleteUser(Long id);
}