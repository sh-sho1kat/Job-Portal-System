package com.sho1kat.dto.applicationServiceDto.response;

import com.sho1kat.enums.ApplicationStatus;
import com.sho1kat.dto.jobServiceDto.response.CompanySummaryResponse;
import com.sho1kat.dto.jobServiceDto.response.JobSummaryResponse;
import com.sho1kat.dto.user_service.response.UserResponse;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * One job application, from the candidate's or the company's point of view.
 *
 * Cross-service payloads ({@code candidate}, {@code company}, {@code job}) are
 * application-service "denormalised" stand-ins: only the ids are known locally,
 * the display fields stay null until service integration lands (TODO same as
 * CompanySummaryResponse on job cards).
 */
public record ApplicationResponse(
        Long id,

        UserResponse candidate,

        Long employerId,

        CompanySummaryResponse company,

        JobSummaryResponse job,

        Long resumeId,

        String coverLetter,

        BigDecimal expectedSalary,

        LocalDate availableFrom,

        ApplicationStatus status,

        boolean isStarred,

        List<ApplicationNoteResponse> notes,

        WithdrawalResponse withdrawal,

        Instant appliedAt,

        Instant updatedAt,

        ApplicationScreeningResponse screening
) {
}
