package com.sho1kat.dto.jobServiceDto.response;

import com.sho1kat.enums.IndustryType;

/**
 * Company details denormalised onto job cards. job-service cannot fetch
 * company-service data until service discovery is wired up, so until then the
 * mapper fills only {@code id} and leaves the display fields {@code null}.
 */
public record CompanySummaryResponse(
        Long id,
        String name,
        String slug,
        String logoUrl,
        IndustryType industryType
) {
}
