package com.sho1kat.dto.aiServiceDto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

/** Scored, prioritised improvement suggestions for a full resume. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ResumeImprovementResponse(
        int overallScore,
        List<Improvement> improvements,
        List<String> strengths,
        String summary
) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Improvement(
            String section,
            String issue,
            String suggestion,
            String priority
    ) {
    }
}
