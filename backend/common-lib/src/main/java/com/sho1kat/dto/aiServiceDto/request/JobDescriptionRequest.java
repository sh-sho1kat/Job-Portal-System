package com.sho1kat.dto.aiServiceDto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record JobDescriptionRequest(
        @NotBlank(message = "Job title is required")
        @Size(max = 150, message = "Job title cannot exceed 150 characters")
        String title,

        @Size(max = 30, message = "At most 30 skills can be supplied")
        List<String> skills,

        @Size(max = 50, message = "Experience level cannot exceed 50 characters")
        String experienceLevel,

        @Size(max = 50, message = "Job type cannot exceed 50 characters")
        String jobType,

        @Size(max = 50, message = "Work mode cannot exceed 50 characters")
        String workMode,

        @Size(max = 100, message = "Category cannot exceed 100 characters")
        String category,

        @Size(max = 2000, message = "Additional context cannot exceed 2000 characters")
        String additionalContext
) {
}
