package com.sho1kat.service;

import com.sho1kat.dto.userServiceDto.request.UpdateUserStatusRequest;
import com.sho1kat.dto.userServiceDto.response.UserResponse;

public interface AdminService {

    /**
     * Replaces the password of a non-admin account with a generated temporary
     * one, delivered by mail. Mail goes first: the old password stays valid
     * until delivery succeeds. All active sessions are revoked.
     */
    UserResponse resetUserPassword(Long userId);

    UserResponse changeUserStatus(Long userId, UpdateUserStatusRequest request);
}
