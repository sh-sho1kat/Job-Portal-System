package com.sho1kat.service;

import com.sho1kat.dto.userServiceDto.request.CreateAdminRequest;
import com.sho1kat.dto.userServiceDto.request.UpdateUserStatusRequest;
import com.sho1kat.dto.userServiceDto.response.UserResponse;
import org.springframework.data.domain.Page;

public interface SuperAdminService {

    UserResponse createAdmin(CreateAdminRequest request);

    UserResponse changeAdminStatus(Long adminId, UpdateUserStatusRequest request);

    UserResponse resetAdminPassword(Long adminId);

    void deleteAdmin(Long adminId);

    Page<UserResponse> getAllAdmins(int page, int size);
}
