package com.sho1kat.mapper;

import com.sho1kat.dto.jobServiceDto.request.JobCategoryRequest;
import com.sho1kat.dto.jobServiceDto.response.JobCategoryResponse;
import com.sho1kat.entity.JobCategory;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class JobCategoryMapper {

    /** The slug is generated in the service layer (uniqueness check needed). */
    public JobCategory toEntity(JobCategoryRequest request, String slug, JobCategory parent) {
        return JobCategory.builder()
                .name(request.name().trim())
                .slug(slug)
                .description(trimToNull(request.description()))
                .iconUrl(trimToNull(request.iconUrl()))
                .parent(parent)
                .active(request.active() == null || request.active())
                .build();
    }

    /** Partial update: null fields keep their current value. */
    public void updateEntity(JobCategoryRequest request, JobCategory category, JobCategory parent) {
        category.setDescription(trimToNull(request.description()));
        category.setIconUrl(trimToNull(request.iconUrl()));
        category.setParent(parent);
        if (request.active() != null) {
            category.setActive(request.active());
        }
    }

    public JobCategoryResponse toResponse(JobCategory category) {
        return toResponse(category, List.of());
    }

    public JobCategoryResponse toResponse(JobCategory category, List<JobCategoryResponse> children) {
        return new JobCategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getIconUrl(),
                category.getParent() != null ? category.getParent().getId() : null,
                category.isActive(),
                category.getCreatedAt(),
                category.getUpdatedAt(),
                children == null ? List.of() : children
        );
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
