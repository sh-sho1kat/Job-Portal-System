package com.sho1kat.dto.user_service.response;

import com.sho1kat.enums.UserRole;
import com.sho1kat.enums.UserStatus;

import java.time.Instant;

public record UserResponse(
        Long id,
        String firstName,
        String middleName,
        String lastName,
        String email,
        String phoneNumber,
        UserRole userRole,
        UserStatus status,
        String profilePictureUrl,
        Instant createdAt,
        Instant updatedAt,
        Instant lastLoginAt
){

}