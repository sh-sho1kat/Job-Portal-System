package com.sho1kat.mapper;

import com.sho1kat.dto.jobServiceDto.request.JobTagRequest;
import com.sho1kat.dto.jobServiceDto.response.JobTagResponse;
import com.sho1kat.entity.JobTag;
import org.springframework.stereotype.Component;

@Component
public class JobTagMapper {

    /** The slug is generated in the service layer (uniqueness check needed). */
    public JobTag toEntity(JobTagRequest request, String slug) {
        return JobTag.builder()
                .name(request.name().trim())
                .slug(slug)
                .build();
    }

    public JobTagResponse toResponse(JobTag tag) {
        return new JobTagResponse(
                tag.getId(),
                tag.getName(),
                tag.getSlug(),
                tag.getCreatedAt(),
                tag.getUpdatedAt()
        );
    }
}
