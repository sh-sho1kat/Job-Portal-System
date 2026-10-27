package com.sho1kat.dto.ResumeServiceDto.response;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record ProjectResponse(
        Long id,
        String title,
        String description,
        List<String> technologies,
        String projectUrl,
        String sourceCodeUrl,
        LocalDate startDate,
        LocalDate endDate,
        Boolean isOngoing,
        Integer displayOrder,
        Instant createdAt,
        Instant updatedAt
) {
}
