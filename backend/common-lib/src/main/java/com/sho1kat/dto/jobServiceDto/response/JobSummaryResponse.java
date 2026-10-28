package com.sho1kat.dto.jobServiceDto.response;

import com.sho1kat.enums.EmploymentType;
import com.sho1kat.enums.WorkMode;

/**
 * Job summary carried onto application cards. application-service cannot fetch
 * job-service data until service discovery is wired up, so until then the
 * mapper fills only {@code id} and leaves the display fields {@code null}.
 */
public record JobSummaryResponse(
        Long id,
        String title,
        String slug,
        EmploymentType employmentType,
        WorkMode workMode
) {
}
