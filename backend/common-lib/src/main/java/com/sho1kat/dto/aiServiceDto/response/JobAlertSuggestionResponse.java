package com.sho1kat.dto.aiServiceDto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

/** AI-suggested job-alert criteria derived from a candidate's profile. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record JobAlertSuggestionResponse(
        List<String> suggestedKeywords,
        List<String> suggestedLocations,
        List<String> suggestedJobTypes,
        List<String> suggestedWorkModes,
        List<String> suggestedExperienceLevels,
        List<String> suggestedIndustries,
        String reasoning
) {
}
