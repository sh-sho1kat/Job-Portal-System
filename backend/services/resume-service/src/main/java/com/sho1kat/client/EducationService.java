package com.sho1kat.client;

import com.sho1kat.dto.ResumeServiceDto.request.EducationRequest;
import com.sho1kat.dto.ResumeServiceDto.response.EducationResponse;

import java.util.List;

public interface EducationService {

    EducationResponse addEducation(Long resumeId, Long candidateId, EducationRequest request);

    List<EducationResponse> getEducations(Long resumeId, Long candidateId);

    EducationResponse updateEducation(Long educationId, Long resumeId, Long candidateId, EducationRequest request);

    void deleteEducation(Long educationId, Long resumeId, Long candidateId);
}
