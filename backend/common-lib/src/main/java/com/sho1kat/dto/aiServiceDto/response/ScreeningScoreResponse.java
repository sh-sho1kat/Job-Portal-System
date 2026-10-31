package com.sho1kat.dto.aiServiceDto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

/**
 * Objective candidate-vs-job screening result: numeric sub-scores (0-100) plus
 * matched/missing skills and strengths/concerns. Feeds the application inbox
 * `aiScore` / shortlist plumbing of the application-service.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ScreeningScoreResponse(
        int score,
        int skillsMatchScore,
        int experienceMatchScore,
        int educationMatchScore,
        List<String> matchedSkills,
        List<String> missingSkills,
        List<String> strengths,
        List<String> concerns,
        String summary
) {
}
