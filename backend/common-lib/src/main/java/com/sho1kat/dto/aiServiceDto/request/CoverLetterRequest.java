package com.sho1kat.dto.aiServiceDto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CoverLetterRequest(
        @NotBlank(message = "Job title is required")
        @Size(max = 150, message = "Job title cannot exceed 150 characters")
        String jobTitle,

        @Size(max = 10000, message = "Job description cannot exceed 10000 characters")
        String jobDescription,

        @NotBlank(message = "Candidate name is required")
        @Size(max = 150, message = "Candidate name cannot exceed 150 characters")
        String candidateName,

        @Size(max = 2000, message = "Candidate summary cannot exceed 2000 characters")
        String candidateSummary,

        @Size(max = 30, message = "At most 30 candidate skills can be supplied")
        java.util.List<String> candidateSkills,

        @Size(max = 30, message = "At most 30 candidate experience entries can be supplied")
        java.util.List<String> candidateExperience,

        @Size(max = 150, message = "Target company name cannot exceed 150 characters")
        String targetCompanyName
) {
}
