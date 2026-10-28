package com.sho1kat.dto.applicationServiceDto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Candidate apply request.
 *
 * {@code jobId} comes from the job card the candidate applied from;
 * {@code companyId} is copied off that same card so employer views can scope by
 * company. Neither is verified until application-service can look jobs and
 * companies up across services (TODO: gateway/service discovery pending).
 */
public record ApplicationRequest(
        @NotNull(message = "jobId is required")
        Long jobId,

        @NotNull(message = "companyId is required")
        Long companyId,

        @NotNull(message = "resumeId is required")
        Long resumeId,

        @Size(max = 5000, message = "coverLetter must be at most 5000 characters")
        String coverLetter,

        @DecimalMin(value = "0.00", message = "expectedSalary cannot be negative")
        @Digits(integer = 12, fraction = 2, message = "expectedSalary must be a decimal amount with at most 2 fraction digits")
        BigDecimal expectedSalary,

        @FutureOrPresent(message = "availableFrom must be today or in the future")
        LocalDate availableFrom
) {
}
