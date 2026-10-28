package com.sho1kat.dto.jobPreferenceDto.response;

import java.time.Instant;

/**
 * Candidate bookmark as stored by job-preference-service. {@code companyId}
 * and {@code notes} mirror the values supplied at save time.
 */
public record SavedJobResponse(
        Long id,
        Long candidateId,
        Long jobId,
        Long companyId,
        String notes,
        Instant savedAt
) {
}
