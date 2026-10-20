package com.sho1kat.service;


import com.sho1kat.dto.user_service.request.ChangePasswordRequest;
import com.sho1kat.dto.user_service.request.LoginRequest;
import com.sho1kat.dto.user_service.request.RefreshTokenRequest;
import com.sho1kat.dto.user_service.request.RegisterRequest;
import com.sho1kat.dto.user_service.response.AuthResponse;
import com.sho1kat.dto.user_service.response.UserResponse;

public interface AuthService {

    UserResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(RefreshTokenRequest request);

    void logout(RefreshTokenRequest request);

    void changePassword(Long userId, ChangePasswordRequest request);
}