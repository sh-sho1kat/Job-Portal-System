package com.sho1kat.service;

import com.sho1kat.dto.userServiceDto.request.ResetUserPasswordRequest;
import com.sho1kat.dto.userServiceDto.request.UpdateUserStatusRequest;
import com.sho1kat.dto.userServiceDto.response.UserResponse;

public interface AdminService {

    UserResponse resetUserPassword(Long userId, ResetUserPasswordRequest request);

    UserResponse changeUserStatus(Long userId, UpdateUserStatusRequest request);
}
