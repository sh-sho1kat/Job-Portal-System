package com.sho1kat.dto.jobServiceDto.response;

import com.sho1kat.enums.SkillCategory;

import java.time.Instant;

public record JobSkillResponse(
        Long id,
        String name,
        String slug,
        SkillCategory category,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
}
