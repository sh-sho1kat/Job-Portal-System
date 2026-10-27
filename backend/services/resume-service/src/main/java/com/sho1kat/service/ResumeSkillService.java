package com.sho1kat.service;

import com.sho1kat.dto.ResumeServiceDto.request.ResumeSkillRequest;
import com.sho1kat.dto.ResumeServiceDto.response.ResumeSkillResponse;

import java.util.List;

public interface ResumeSkillService {

    ResumeSkillResponse addSkill(Long resumeId, Long candidateId, ResumeSkillRequest request);

    List<ResumeSkillResponse> getSkills(Long resumeId, Long candidateId);

    ResumeSkillResponse updateSkill(Long skillId, Long resumeId, Long candidateId, ResumeSkillRequest request);

    void deleteSkill(Long skillId, Long resumeId, Long candidateId);
}
