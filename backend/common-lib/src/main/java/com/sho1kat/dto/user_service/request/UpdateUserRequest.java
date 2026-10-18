package com.sho1kat.dto.user_service.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(

        @NotBlank(message = "First name is required")
        @Size(max = 50, message = "First name must be at most 50 characters")
        String firstName,

        @Size(max = 50, message = "Middle name must be at most 50 characters")
        String middleName,

        @NotBlank(message = "Last name is required")
        @Size(max = 50, message = "Last name must be at most 50 characters")
        String lastName,

        @Pattern(regexp = "^\\+?[0-9]{7,15}$", message = "Phone number is not valid")
        String phoneNumber,

        @Size(max = 255, message = "Profile picture URL must be at most 255 characters")
        String profilePictureUrl
) {
}