package com.sho1kat.dto.aiServiceDto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * One raw work-experience entry destined for bullet-point refinement.
 * Kept separate from the resume-service `WorkExperienceRequest` (that one is
 * the persisted-section payload); this is the AI input shape.
 */
public record WorkExperienceRequest(
        @NotBlank(message = "Job title is required")
        @Size(max = 150, message = "Job title cannot exceed 150 characters")
        String jobTitle,

        @Size(max = 150, message = "Company cannot exceed 150 characters")
        String company,

        @NotBlank(message = "Raw description is required")
        @Size(max = 5000, message = "Raw description cannot exceed 5000 characters")
        String rawDescription,

        @Size(max = 2000, message = "Achievements hint cannot exceed 2000 characters")
        String achievementsHint
) {
}
