package com.sho1kat.dto.aiServiceDto.request;

import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Candidate-vs-job screening input. All fields optional — the AI scores with
 * whatever context was supplied (an empty profile simply scores low).
 */
public record ScreeningScoreRequest(
        @Size(max = 150, message = "Job title cannot exceed 150 characters")
        String jobTitle,

        @Size(max = 50, message = "Experience level cannot exceed 50 characters")
        String experienceLevel,

        @Size(max = 30, message = "At most 30 required skills can be supplied")
        List<String> requiredSkills,

        @Size(max = 10000, message = "Responsibilities cannot exceed 10000 characters")
        String responsibilities,

        @Size(max = 2000, message = "Candidate summary cannot exceed 2000 characters")
        String candidateSummary,

        @Size(max = 30, message = "At most 30 candidate skills can be supplied")
        List<String> candidateSkills,

        @Size(max = 30, message = "At most 30 candidate experience entries can be supplied")
        List<String> candidateExperience
) {
}
