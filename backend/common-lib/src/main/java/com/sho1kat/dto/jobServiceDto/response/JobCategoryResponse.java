package com.sho1kat.dto.jobServiceDto.response;

import java.time.Instant;
import java.util.List;

/** Category with its sub-categories nested (flat records, tree assembled in the service). */
public record JobCategoryResponse(
        Long id,
        String name,
        String slug,
        String description,
        String iconUrl,
        Long parentId,
        boolean active,
        Instant createdAt,
        Instant updatedAt,
        List<JobCategoryResponse> children
) {
}
