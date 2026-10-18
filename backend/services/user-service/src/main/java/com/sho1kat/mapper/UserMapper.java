package com.sho1kat.mapper;

import com.sho1kat.dto.user_service.request.RegisterRequest;
import com.sho1kat.dto.user_service.request.UpdateUserRequest;
import com.sho1kat.dto.user_service.response.UserResponse;
import com.sho1kat.entity.User;
import com.sho1kat.enums.UserStatus;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(RegisterRequest request, String passwordHash) {
        return User.builder()
                .firstName(request.firstName().trim())
                .middleName(trimToNull(request.middleName()))
                .lastName(request.lastName().trim())
                .email(request.email().trim().toLowerCase())
                .passwordHash(passwordHash)
                .phoneNumber(trimToNull(request.phoneNumber()))
                .userRole(request.userRole())
                .status(UserStatus.ACTIVE)
                .build();
    }

    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getMiddleName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getUserRole(),
                user.getStatus(),
                user.getProfilePictureUrl(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                user.getLastLoginAt()
        );
    }

    public void updateEntity(UpdateUserRequest request, User user) {
        user.setFirstName(request.firstName().trim());
        user.setMiddleName(trimToNull(request.middleName()));
        user.setLastName(request.lastName().trim());
        user.setPhoneNumber(trimToNull(request.phoneNumber()));
        user.setProfilePictureUrl(trimToNull(request.profilePictureUrl()));
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}