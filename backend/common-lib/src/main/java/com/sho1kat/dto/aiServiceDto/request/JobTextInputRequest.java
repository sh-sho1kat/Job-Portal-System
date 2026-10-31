package com.sho1kat.dto.aiServiceDto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Free-text job context for the recommendation endpoints (skills / tags).
 * `description` carries the posting draft or role summary the AI should mine.
 */
public record JobTextInputRequest(
        @NotBlank(message = "Job title is required")
        @Size(max = 150, message = "Job title cannot exceed 150 characters")
        String title,

        @Size(max = 10000, message = "Description cannot exceed 10000 characters")
        String description
) {
}
