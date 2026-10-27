package com.sho1kat.dto.ResumeServiceDto.response;

import java.time.Instant;
import java.time.LocalDate;

public record EducationResponse(
        Long id,
        String institutionName,
        String degree,
        String fieldOfStudy,
        String grade,
        LocalDate startDate,
        LocalDate endDate,
        Boolean isCurrentlyStudying,
        String description,
        Integer displayOrder,
        Instant createdAt,
        Instant updatedAt
) {
}
