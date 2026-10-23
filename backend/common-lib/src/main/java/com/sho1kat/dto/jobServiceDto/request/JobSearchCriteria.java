package com.sho1kat.dto.jobServiceDto.request;

import com.sho1kat.enums.EmploymentType;
import com.sho1kat.enums.ExperienceLevel;
import com.sho1kat.enums.SalaryPeriod;
import com.sho1kat.enums.WorkMode;

import java.util.Set;

public record JobSearchCriteria(
        String keyword,
        Long companyId,
        EmploymentType employmentType,
        ExperienceLevel experienceLevel,
        WorkMode workMode,
        String location,
        SalaryPeriod salaryPeriod,
        Long categoryId,
        Set<Long> skillIds,
        Set<Long> tagIds
) {
}
