package com.sho1kat.dto.aiServiceDto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CareerFeedbackRequest(
        @NotBlank(message = "Resume content is required")
        @Size(max = 20000, message = "Resume content cannot exceed 20000 characters")
        String resumeContent,

        // Optional — when provided the feedback is tailored toward this role
        @Size(max = 150, message = "Target job title cannot exceed 150 characters")
        String targetJobTitle
) {
}
