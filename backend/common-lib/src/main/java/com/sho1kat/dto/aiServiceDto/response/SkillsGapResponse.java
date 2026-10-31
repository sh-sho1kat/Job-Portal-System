package com.sho1kat.dto.aiServiceDto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

/** Skills-gap analysis between a candidate profile and a target role. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record SkillsGapResponse(
        List<String> matchedSkills,
        List<String> missingSkills,
        List<String> partialMatch,
        List<String> prioritySkillsToLearn,
        List<LearningRecommendation> learningRecommendations,
        String overallReadiness,
        String summary
) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record LearningRecommendation(
            String skill,
            String why,
            String howToLearn
    ) {
    }
}
