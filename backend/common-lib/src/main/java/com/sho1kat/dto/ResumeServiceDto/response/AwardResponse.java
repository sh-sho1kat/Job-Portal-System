package com.sho1kat.dto.ResumeServiceDto.response;

import java.time.Instant;
import java.time.LocalDate;

public record AwardResponse(
        Long id,
        String title,
        String issuer,
        LocalDate dateAwarded,
        String description,
        Integer displayOrder,
        Instant createdAt,
        Instant updatedAt
) {
}
