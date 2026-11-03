package com.sho1kat.security;

import com.sho1kat.enums.UserRole;
import com.sho1kat.exception.ApiException;

public record RequesterContext(
        Long userId,
        String role
) {

    public static final String USER_ID_HEADER = "X-User-Id";
    public static final String USER_ROLE_HEADER = "X-User-Role";

    public static RequesterContext fromHeaders(String userId, String role) {

        if (userId == null || userId.isBlank()) {
            throw ApiException.unauthorized(
                    "Missing " + USER_ID_HEADER + " header"
            );
        }

        if (role == null || role.isBlank()) {
            throw ApiException.unauthorized(
                    "Missing " + USER_ROLE_HEADER + " header"
            );
        }

        return new RequesterContext(Long.parseLong(userId.trim()), role);
    }

    public void RequireRole(String Role) {
        {
            if (!Role.equals(role)) {
                throw ApiException.forbidden(
                        "You don't have permission to perform this operation"
                );
            }
        }

    }
    public void checkIfJobSeeker() {
        if (UserRole.ROLE_JOB_SEEKER.name().equals(role)) {
            throw ApiException.forbidden(
                    "You don't have permission to perform this operation"
            );
        }
    }

    public boolean isAdmin() {
        return UserRole.ROLE_ADMIN.name().equals(role)
                || UserRole.ROLE_SUPER_ADMIN.name().equals(role);
    }

}