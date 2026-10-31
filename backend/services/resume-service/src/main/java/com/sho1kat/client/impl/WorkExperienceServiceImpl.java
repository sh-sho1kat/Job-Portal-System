package com.sho1kat.client.impl;

import com.sho1kat.dto.ResumeServiceDto.request.WorkExperienceRequest;
import com.sho1kat.dto.ResumeServiceDto.response.WorkExperienceResponse;
import com.sho1kat.entity.Resume;
import com.sho1kat.entity.WorkExperience;
import com.sho1kat.exception.ApiException;
import com.sho1kat.mapper.WorkExperienceMapper;
import com.sho1kat.repository.WorkExperienceRepository;
import com.sho1kat.client.ResumeService;
import com.sho1kat.client.WorkExperienceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkExperienceServiceImpl implements WorkExperienceService {

    private final ResumeService resumeService;
    private final WorkExperienceRepository workExperienceRepository;
    private final WorkExperienceMapper workExperienceMapper;

    @Override
    @Transactional
    public WorkExperienceResponse createWorkExperience(Long resumeId, Long candidateId,
                                                       WorkExperienceRequest request) {
        Resume resume = resumeService.requireOwnedResume(resumeId, candidateId);
        validate(request);
        WorkExperience experience = workExperienceRepository.save(
                workExperienceMapper.toEntity(resume, request));
        resumeService.refreshCompletionScore(resume);
        return workExperienceMapper.toResponse(experience);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkExperienceResponse> getAllWorkExperiences(Long resumeId, Long candidateId) {
        Resume resume = resumeService.requireOwnedResume(resumeId, candidateId);
        return workExperienceRepository.findByResumeIdOrderByDisplayOrderAscIdAsc(resume.getId())
                .stream()
                .map(workExperienceMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public WorkExperienceResponse updateWorkExperience(Long workExperienceId, Long resumeId, Long candidateId,
                                                       WorkExperienceRequest request) {
        Resume resume = resumeService.requireOwnedResume(resumeId, candidateId);
        WorkExperience experience = requireWorkExperience(workExperienceId, resume.getId());
        validate(request);
        workExperienceMapper.updateEntity(request, experience);
        if (Boolean.TRUE.equals(request.isCurrentJob())) {
            experience.setEndDate(null); // the current job never gets an end date
        }
        WorkExperience saved = workExperienceRepository.save(experience);
        resumeService.refreshCompletionScore(resume);
        return workExperienceMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteWorkExperience(Long workExperienceId, Long resumeId, Long candidateId) {
        Resume resume = resumeService.requireOwnedResume(resumeId, candidateId);
        WorkExperience experience = requireWorkExperience(workExperienceId, resume.getId());
        workExperienceRepository.delete(experience);
        resumeService.refreshCompletionScore(resume);
    }

    // ---- helpers ----

    private WorkExperience requireWorkExperience(Long workExperienceId, Long resumeId) {
        return workExperienceRepository.findByIdAndResumeId(workExperienceId, resumeId)
                .orElseThrow(() -> ApiException.notFound("Work experience not found with id: " + workExperienceId));
    }

    /** The current job needs no end date; a past one must have a non-overlapping date range. */
    private void validate(WorkExperienceRequest request) {
        boolean current = Boolean.TRUE.equals(request.isCurrentJob());
        if (!current && request.endDate() == null) {
            throw ApiException.badRequest("endDate is required unless isCurrentJob is true");
        }
        if (!current && request.startDate().isAfter(request.endDate())) {
            throw ApiException.badRequest("endDate cannot be before startDate");
        }
    }
}
