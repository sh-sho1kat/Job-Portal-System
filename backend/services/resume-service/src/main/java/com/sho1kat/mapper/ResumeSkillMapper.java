package com.sho1kat.mapper;

import com.sho1kat.dto.ResumeServiceDto.request.ResumeSkillRequest;
import com.sho1kat.dto.ResumeServiceDto.response.ResumeSkillResponse;
import com.sho1kat.entity.Resume;
import com.sho1kat.entity.ResumeSkill;
import org.springframework.stereotype.Component;

@Component
public class ResumeSkillMapper {

    public ResumeSkill toEntity(Resume resume, ResumeSkillRequest request) {
        return ResumeSkill.builder()
                .resume(resume)
                .skillName(request.skillName().trim())
                .proficiency(request.proficiencyLevel())
                .yearsOfExperience(request.yearsOfExperience() == null ? 0 : request.yearsOfExperience())
                .displayOrder(request.displayOrder() == null ? 0 : request.displayOrder())
                .build();
    }

    public void updateEntity(ResumeSkillRequest request, ResumeSkill skill) {
        skill.setSkillName(request.skillName().trim());
        skill.setProficiency(request.proficiencyLevel());
        skill.setYearsOfExperience(request.yearsOfExperience() == null ? 0 : request.yearsOfExperience());
        skill.setDisplayOrder(request.displayOrder() == null ? 0 : request.displayOrder());
    }

    public ResumeSkillResponse toResponse(ResumeSkill skill) {
        return new ResumeSkillResponse(
                skill.getId(),
                skill.getSkillName(),
                skill.getProficiency(),
                skill.getYearsOfExperience(),
                skill.getDisplayOrder(),
                skill.getCreatedAt(),
                skill.getUpdatedAt()
        );
    }
}
