package com.sho1kat.dto.applicationServiceDto.response;

import com.sho1kat.enums.ApplicationStatus;
import com.sho1kat.dto.jobServiceDto.response.CompanySummaryResponse;
import com.sho1kat.dto.jobServiceDto.response.JobSummaryResponse;
import com.sho1kat.dto.user_service.response.UserResponse;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

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
