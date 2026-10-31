package com.sho1kat.dto.aiServiceDto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;

/** AI-suggested salary band for a role (amounts as plain numbers). */
@JsonIgnoreProperties(ignoreUnknown = true)
public record SalaryRangeResponse(
        BigDecimal minSalary,
        BigDecimal maxSalary,
        String currency,
        String period,
        String marketInsight
) {
}
