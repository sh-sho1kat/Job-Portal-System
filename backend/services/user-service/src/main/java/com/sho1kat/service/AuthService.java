package com.sho1kat.service;


import com.sho1kat.dto.userServiceDto.request.ChangePasswordRequest;
import com.sho1kat.dto.userServiceDto.request.LoginRequest;
import com.sho1kat.dto.userServiceDto.request.RefreshTokenRequest;
import com.sho1kat.dto.userServiceDto.request.RegisterRequest;
import com.sho1kat.dto.userServiceDto.response.AuthResponse;
import com.sho1kat.dto.userServiceDto.response.UserResponse;

public interface AuthService {

    UserResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(RefreshTokenRequest request);

    void logout(RefreshTokenRequest request);

    void changePassword(Long userId, ChangePasswordRequest request);
}