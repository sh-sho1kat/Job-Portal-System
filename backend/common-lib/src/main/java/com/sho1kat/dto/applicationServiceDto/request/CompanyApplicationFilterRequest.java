package com.sho1kat.dto.applicationServiceDto.request;

import com.sho1kat.enums.AiShortListStatus;
import com.sho1kat.enums.ApplicationStatus;

public record CompanyApplicationFilterRequest(
        Long job,
        ApplicationStatus status,
        Boolean isStarred,
        AiShortListStatus aiShortListStatus,
        Integer minAiScore,
        String sortBy
) {
}
