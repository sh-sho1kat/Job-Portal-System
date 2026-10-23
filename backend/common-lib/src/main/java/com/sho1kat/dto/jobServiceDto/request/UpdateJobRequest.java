package com.sho1kat.dto.jobServiceDto.request;

import com.sho1kat.enums.EmploymentType;
import com.sho1kat.enums.ExperienceLevel;
import com.sho1kat.enums.SalaryPeriod;
import com.sho1kat.enums.WorkMode;
import com.sho1kat.util.RegexPatterns;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

/**
 * Full-replace update of a job posting. The company cannot be changed and the
 * application deadline is not required to lie in the future: employers can
 * edit other fields while a deadline has already elapsed without being forced
 * to extend it.
 */
public record UpdateJobRequest(
        @NotBlank(message = "title is required")
        @Size(max = 150, message = "title must be at most 150 characters")
        String title,

        @NotBlank(message = "description is required")
        @Size(max = 10000, message = "description must be at most 10000 characters")
        String description,

        @Size(max = 10000, message = "responsibilities must be at most 10000 characters")
        String responsibilities,

        @Size(max = 10000, message = "requirements must be at most 10000 characters")
        String requirements,

        @Size(max = 5000, message = "benefits must be at most 5000 characters")
        String benefits,

        @NotNull(message = "employmentType is required")
        EmploymentType employmentType,

        @NotNull(message = "experienceLevel is required")
        ExperienceLevel experienceLevel,

        @NotNull(message = "workMode is required")
        WorkMode workMode,

        @Size(max = 255, message = "address must be at most 255 characters")
        String address,

        @Size(max = 100, message = "city must be at most 100 characters")
        String city,

        @Size(max = 100, message = "state must be at most 100 characters")
        String state,

        @Size(max = 100, message = "country must be at most 100 characters")
        String country,

        @Size(max = 20, message = "zipCode must be at most 20 characters")
        String zipCode,

        @DecimalMin(value = "0.00", message = "salaryMin cannot be negative")
        @Digits(integer = 12, fraction = 2, message = "salaryMin must be a decimal amount with at most 2 fraction digits")
        BigDecimal salaryMin,

        @DecimalMin(value = "0.00", message = "salaryMax cannot be negative")
        @Digits(integer = 12, fraction = 2, message = "salaryMax must be a decimal amount with at most 2 fraction digits")
        BigDecimal salaryMax,

        @Pattern(regexp = RegexPatterns.CURRENCY_CODE, message = "salaryCurrency must be a 3-letter uppercase currency code (ISO 4217)")
        String salaryCurrency,

        SalaryPeriod salaryPeriod,

        @NotNull(message = "categoryId is required")
        Long categoryId,

        @Size(max = 20, message = "at most 20 skills")
        Set<@NotNull Long> skillIds,

        @Size(max = 20, message = "at most 20 tags")
        Set<@NotNull Long> tagIds,

        @NotNull(message = "vacancies is required")
        @Min(value = 1, message = "vacancies must be at least 1")
        @Max(value = 10000, message = "vacancies must be at most 10000")
        Integer vacancies,

        LocalDate applicationDeadline,

        LocalDate expiresAt
) {
}
