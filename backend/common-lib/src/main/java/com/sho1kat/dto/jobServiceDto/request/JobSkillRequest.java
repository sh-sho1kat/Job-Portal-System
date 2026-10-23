package com.sho1kat.dto.jobServiceDto.request;

import com.sho1kat.enums.SkillCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Used for create and update. On update, a {@code null} keeps the current
 * value (only name cannot change to keep existing slugs stable).
 */
public record JobSkillRequest(
        @NotBlank(message = "name is required")
        @Size(max = 100, message = "name must be at most 100 characters")
        String name,

        @NotNull(message = "category is required")
        SkillCategory category,

        Boolean active
) {
}
