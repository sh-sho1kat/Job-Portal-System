package com.sho1kat.dto.applicationServiceDto.response;

import com.sho1kat.enums.AiShortListStatus;

/**
 * AI screening snapshot of an application. Screening itself is a roadmap
 * feature; until any scoring runs, applications carry
 * {@code aiShortListStatus = NOT_SCREENED} and a null score, and the value
 * stays stable.
 */
public record ApplicationScreeningResponse(
        AiShortListStatus aiShortListStatus,
        Integer aiScore
) {
}
