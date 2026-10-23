package com.sho1kat.dto.jobServiceDto.response;

import com.sho1kat.enums.EmploymentType;
import com.sho1kat.enums.ExperienceLevel;
import com.sho1kat.enums.JobStatus;
import com.sho1kat.enums.SalaryPeriod;
import com.sho1kat.enums.WorkMode;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/** Full job posting for the employer who owns it and for admins. */
public record DetailedJobResponse(

        Long id,
        Long companyId,
        Long postedByOwnerId,
        CompanySummaryResponse company,

        // info
        String title,
        String description,
        String responsibilities,
        String requirements,
        String benefits,

        // location (flattened JobLocation)
        String address,
        String city,
        String state,
        String country,
        String zipCode,

        // job details
        EmploymentType employmentType,
        ExperienceLevel experienceLevel,
        WorkMode workMode,

        // taxonomy references
        Long categoryId,
        List<Long> skillIds,
        List<Long> tagIds,

        // salary (flattened SalaryRange)
        BigDecimal salaryMin,
        BigDecimal salaryMax,
        String salaryCurrency,
        SalaryPeriod salaryPeriod,

        // posting details
        Integer vacancies,
        LocalDate applicationDeadline,
        LocalDate expiresAt,
        JobStatus status,

        // counters (application-service not built yet; always 0 until then)
        Long viewCount,
        Long applicationCount,

        Instant publishedAt,
        Instant closedAt,
        Instant createdAt,
        Instant updatedAt

) {
}
