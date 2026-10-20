package com.sho1kat.dto.user_service.response;

//public record AuthResponse(
//    String jwt,
//    String title,
//    String message,
//    UserResponse userResponse
//) {
//}


public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn,        // access token lifetime in seconds
        UserResponse user
) {
}