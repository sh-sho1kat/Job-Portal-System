package com.sho1kat.dto.userServiceDto.response;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        String message,
        long expiresIn,
        UserResponse user
) {
}