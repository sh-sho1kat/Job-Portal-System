package com.sho1kat.client;

import com.sho1kat.dto.ResumeServiceDto.request.WorkExperienceRequest;
import com.sho1kat.dto.ResumeServiceDto.response.WorkExperienceResponse;

import java.util.List;

public interface WorkExperienceService {

    WorkExperienceResponse createWorkExperience(Long resumeId, Long candidateId, WorkExperienceRequest request);

    List<WorkExperienceResponse> getAllWorkExperiences(Long resumeId, Long candidateId);

    WorkExperienceResponse updateWorkExperience(Long workExperienceId, Long resumeId, Long candidateId,
                                                WorkExperienceRequest request);

    void deleteWorkExperience(Long workExperienceId, Long resumeId, Long candidateId);
}
