package com.sho1kat.dto.user_service.request;

import jakarta.validation.constraints.NotBlank;

public record RefreshTokenRequest(

        @NotBlank(message = "Refresh token is required")
        String refreshToken
) {
}