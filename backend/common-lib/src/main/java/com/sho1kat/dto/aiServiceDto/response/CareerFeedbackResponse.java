package com.sho1kat.dto.aiServiceDto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

/** Honest, actionable career feedback report built from a full resume. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record CareerFeedbackResponse(
        int profileStrength,
        List<String> shortlistingIssues,
        List<Improvement> improvements,
        List<JobTarget> targetJobs,
        String overallSummary
) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Improvement(
            String area,
            String issue,
            String action,
            String priority
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record JobTarget(
            String jobTitle,
            String reason,
            String skillMatch
    ) {
    }
}
