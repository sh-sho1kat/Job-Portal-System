package com.sho1kat.dto.ResumeServiceDto.response;

import com.sho1kat.enums.LanguageProficiency;

import java.time.Instant;

public record LanguageProficiencyResponse(
        Long id,
        String language,
        LanguageProficiency proficiency,
        Integer displayOrder,
        Instant createdAt,
        Instant updatedAt
) {
}
