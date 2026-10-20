package com.sho1kat.security;

import com.sho1kat.enums.UserRole;

public record AuthenticatedUser(Long id, String email, UserRole role) {
}