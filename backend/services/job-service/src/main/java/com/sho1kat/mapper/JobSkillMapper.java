package com.sho1kat.mapper;

import com.sho1kat.dto.jobServiceDto.request.JobSkillRequest;
import com.sho1kat.dto.jobServiceDto.response.JobSkillResponse;
import com.sho1kat.entity.JobSkill;
import org.springframework.stereotype.Component;

@Component
public class JobSkillMapper {

    /** The slug is generated in the service layer (uniqueness check needed). */
    public JobSkill toEntity(JobSkillRequest request, String slug) {
        return JobSkill.builder()
                .name(request.name().trim())
                .slug(slug)
                .category(request.category())
                .active(request.active() == null || request.active())
                .build();
    }

    /** Partial update: null fields keep their current value. */
    public void updateEntity(JobSkillRequest request, JobSkill skill) {
        skill.setCategory(request.category());
        if (request.active() != null) {
            skill.setActive(request.active());
        }
    }

    public JobSkillResponse toResponse(JobSkill skill) {
        return new JobSkillResponse(
                skill.getId(),
                skill.getName(),
                skill.getSlug(),
                skill.getCategory(),
                skill.isActive(),
                skill.getCreatedAt(),
                skill.getUpdatedAt()
        );
    }
}
