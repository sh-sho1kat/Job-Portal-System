package com.sho1kat.dto.ResumeServiceDto.response;

import com.sho1kat.enums.ProficiencyLevel;

import java.time.Instant;

public record ResumeSkillResponse(
        Long id,
        String skillName,
        ProficiencyLevel proficiencyLevel,
        Integer yearsOfExperience,
        Integer displayOrder,
        Instant createdAt,
        Instant updatedAt
) {
}
