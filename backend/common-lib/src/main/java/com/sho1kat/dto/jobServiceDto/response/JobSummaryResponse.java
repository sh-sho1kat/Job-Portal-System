package com.sho1kat.dto.jobServiceDto.response;

import com.sho1kat.enums.EmploymentType;
import com.sho1kat.enums.WorkMode;

public record JobSummaryResponse(
        Long id,
        String title,
        String slug,
        EmploymentType employmentType,
        WorkMode workMode
) {
}
