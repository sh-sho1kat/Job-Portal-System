package com.sho1kat.dto.companyServiceDto.response;

import com.sho1kat.enums.IndustryType;

public record CompanySummaryResponse(
        Long id,
        String name,
        String slug,
        String logoUrl,
        IndustryType industryType
) {
}
