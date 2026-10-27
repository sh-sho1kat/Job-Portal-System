package com.sho1kat.service.impl;

import com.sho1kat.dto.ResumeServiceDto.request.EducationRequest;
import com.sho1kat.dto.ResumeServiceDto.response.EducationResponse;
import com.sho1kat.entity.Education;
import com.sho1kat.entity.Resume;
import com.sho1kat.exception.ApiException;
import com.sho1kat.mapper.EducationMapper;
import com.sho1kat.repository.EducationRepository;
import com.sho1kat.service.EducationService;
import com.sho1kat.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EducationServiceImpl implements EducationService {

    private final ResumeService resumeService;
    private final EducationRepository educationRepository;
    private final EducationMapper educationMapper;

    @Override
    @Transactional
    public EducationResponse addEducation(Long resumeId, Long candidateId, EducationRequest request) {
        Resume resume = resumeService.requireOwnedResume(resumeId, candidateId);
        validate(request);
        Education education = educationRepository.save(educationMapper.toEntity(resume, request));
        resumeService.refreshCompletionScore(resume);
        return educationMapper.toResponse(education);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EducationResponse> getEducations(Long resumeId, Long candidateId) {
        Resume resume = resumeService.requireOwnedResume(resumeId, candidateId);
        return educationRepository.findByResumeIdOrderByDisplayOrderAscIdAsc(resume.getId())
                .stream()
                .map(educationMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public EducationResponse updateEducation(Long educationId, Long resumeId, Long candidateId,
                                             EducationRequest request) {
        Resume resume = resumeService.requireOwnedResume(resumeId, candidateId);
        Education education = requireEducation(educationId, resume.getId());
        validate(request);
        educationMapper.updateEntity(request, education);
        if (Boolean.TRUE.equals(request.isCurrentlyStudying())) {
            education.setEndDate(null); // still studying there
        }
        Education saved = educationRepository.save(education);
        resumeService.refreshCompletionScore(resume);
        return educationMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteEducation(Long educationId, Long resumeId, Long candidateId) {
        Resume resume = resumeService.requireOwnedResume(resumeId, candidateId);
        Education education = requireEducation(educationId, resume.getId());
        educationRepository.delete(education);
        resumeService.refreshCompletionScore(resume);
    }

    // ---- helpers ----

    private Education requireEducation(Long educationId, Long resumeId) {
        return educationRepository.findByIdAndResumeId(educationId, resumeId)
                .orElseThrow(() -> ApiException.notFound("Education not found with id: " + educationId));
    }

    /** Ongoing studies need no end date; finished ones need a valid range. */
    private void validate(EducationRequest request) {
        boolean studying = Boolean.TRUE.equals(request.isCurrentlyStudying());
        if (!studying && request.endDate() == null) {
            throw ApiException.badRequest("endDate is required unless isCurrentlyStudying is true");
        }
        if (!studying && request.startDate().isAfter(request.endDate())) {
            throw ApiException.badRequest("endDate cannot be before startDate");
        }
    }
}
