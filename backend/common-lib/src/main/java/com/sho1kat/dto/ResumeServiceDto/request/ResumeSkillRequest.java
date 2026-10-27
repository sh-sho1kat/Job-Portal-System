package com.sho1kat.dto.ResumeServiceDto.request;

import com.sho1kat.enums.ProficiencyLevel;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ResumeSkillRequest(

        @NotBlank(message = "skillName is required")
        @Size(max = 100, message = "skillName must be at most 100 characters")
        String skillName,

        @NotNull(message = "proficiencyLevel is required")
        ProficiencyLevel proficiencyLevel,

        @Min(value = 0, message = "yearsOfExperience cannot be negative")
        @Max(value = 50, message = "yearsOfExperience must be at most 50")
        Integer yearsOfExperience,

        Integer displayOrder
) {
}
