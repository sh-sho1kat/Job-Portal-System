package com.sho1kat.dto.companyServiceDto.response;

import com.sho1kat.enums.IndustryType;

/**
 * Company details denormalised onto job cards. job-service populates these by
 * looking the company up in company-service over service discovery
 * ({@code CompanyClient}); when that lookup fails (company-service unreachable,
 * or an unknown/deactivated company) the card degrades to {@code id}-only.
 */
public record CompanySummaryResponse(
        Long id,
        String name,
        String slug,
        String logoUrl,
        IndustryType industryType
) {
}
