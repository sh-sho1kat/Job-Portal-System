package com.sho1kat.dto.jobPreferenceDto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Candidate bookmark request.
 *
 * {@code jobId} comes from the job card the candidate saved;
 * {@code companyId} is copied off that same card (denormalized so listings can
 * scope by company without a Feign call). Neither is verified until
 * job-preference-service can look jobs and companies up across services (TODO:
 * gateway/service discovery pending).
 */
public record SavedJobRequest(
        @NotNull(message = "jobId is required")
        Long jobId,

        @NotNull(message = "companyId is required")
        Long companyId,

        @Size(max = 2000, message = "notes must be at most 2000 characters")
        String notes
) {
}
