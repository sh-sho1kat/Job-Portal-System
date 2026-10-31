package com.sho1kat.dto.aiServiceDto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record SkillsGapRequest(
        @NotBlank(message = "Job title is required")
        @Size(max = 150, message = "Job title cannot exceed 150 characters")
        String jobTitle,

        @Size(max = 50, message = "At most 50 candidate skills can be supplied")
        List<String> candidateSkills,

        @Size(max = 50, message = "At most 50 required skills can be supplied")
        List<String> requiredSkills
) {
}
