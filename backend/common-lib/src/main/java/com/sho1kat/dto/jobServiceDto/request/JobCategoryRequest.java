package com.sho1kat.dto.jobServiceDto.request;

import com.sho1kat.util.RegexPatterns;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Used for create and update. On update, a {@code null} keeps the current
 * value (only name cannot change to keep existing slugs stable).
 */
public record JobCategoryRequest(
        @NotBlank(message = "name is required")
        @Size(max = 100, message = "name must be at most 100 characters")
        String name,

        @Size(max = 1000, message = "description must be at most 1000 characters")
        String description,

        @Size(max = 500, message = "iconUrl must be at most 500 characters")
        @Pattern(regexp = RegexPatterns.HTTP_URL, message = "iconUrl must be a valid URL")
        String iconUrl,

        Long parentId,

        Boolean active
) {
}
