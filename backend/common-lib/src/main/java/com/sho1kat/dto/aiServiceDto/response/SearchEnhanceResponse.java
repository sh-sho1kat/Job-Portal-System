package com.sho1kat.dto.aiServiceDto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.util.List;

/**
 * Structured search criteria extracted from a natural-language query.
 * Fields stay null/empty unless the query mentioned or clearly implied them;
 * the enum values map onto the job-service filter enums.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record SearchEnhanceResponse(
        List<String> keywords,
        List<String> locations,
        List<String> jobTypes,
        List<String> workModes,
        List<String> experienceLevels,
        BigDecimal minSalary,
        List<String> skills
) {
}
