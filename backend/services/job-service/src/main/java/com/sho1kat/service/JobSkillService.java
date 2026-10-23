package com.sho1kat.service;

import com.sho1kat.dto.jobServiceDto.request.JobSkillRequest;
import com.sho1kat.dto.jobServiceDto.response.JobSkillResponse;
import com.sho1kat.entity.JobSkill;

import java.util.List;
import java.util.Set;

public interface JobSkillService {
    JobSkillResponse createJobSkill(Long requesterId, JobSkillRequest request);

    List<JobSkillResponse> getAllJobSkills();

    JobSkillResponse getJobSkillById(Long id);

    JobSkillResponse updateJobSkill(Long id, Long requesterId, JobSkillRequest request);

    void deleteJobSkill(Long id, Long requesterId);

    /** Resolves every id for a posting; throws if any id is unknown. */
    List<JobSkill> getJobSkillsByIds(Set<Long> ids);
}
