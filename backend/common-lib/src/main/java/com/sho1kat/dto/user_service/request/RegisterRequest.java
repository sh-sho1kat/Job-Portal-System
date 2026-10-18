package com.sho1kat.dto.user_service.request;

import com.sho1kat.enums.UserRole;
import jakarta.validation.constraints.*;

public record RegisterRequest(

        @NotBlank(message = "First name is required")
        @Size(max = 50, message = "First name must be at most 50 characters")
        String firstName,

        @Size(max = 50, message = "Middle name must be at most 50 characters")
        String middleName,

        @NotBlank(message = "Last name is required")
        @Size(max = 50, message = "Last name must be at most 50 characters")
        String lastName,

        @NotBlank(message = "Email is required")
        @Email(message = "Email is not valid")
        @Size(max = 150, message = "Email must be at most 150 characters")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 64, message = "Password must be 8-64 characters")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$",
                message = "Password must contain at least one letter and one digit")
        String password,

        @Pattern(regexp = "^\\+?[0-9]{7,15}$", message = "Phone number is not valid")
        String phoneNumber,

        @NotNull(message = "User role is required")
        UserRole userRole
) {
}