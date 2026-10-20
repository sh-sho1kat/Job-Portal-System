package com.sho1kat.dto.user_service.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        @NotBlank(message = "Current password is required")
        String currentPassword,

        @NotBlank(message = "New password is required")
        @Size(
                min = 8,
                max = 64,
                message = "Password must be between 8 and 64 characters"
        )
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).+$",
                message = "Password must contain at least one uppercase letter, " +
                        "one lowercase letter, one digit, and one special character"
        )
        String newPassword,

        @NotBlank(message = "Confirm password is required")
        String confirmPassword
) {
    @AssertTrue(message = "New password and confirm password must match")
    public boolean isPasswordMatching() {
        return newPassword != null
                && newPassword.equals(confirmPassword);
    }
}


