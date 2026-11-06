package com.sho1kat.dto.userServiceDto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Password an admin sets for a (non-admin) user; same rules as registration. */
public record ResetUserPasswordRequest(

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 64, message = "Password must be 8-64 characters")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).+$",
                message = "Password must contain at least one uppercase letter, " +
                        "one lowercase letter, one digit, and one special character"
        )
        String newPassword
) {
}
