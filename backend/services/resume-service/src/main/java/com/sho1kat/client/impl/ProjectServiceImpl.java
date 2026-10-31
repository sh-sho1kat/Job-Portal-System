package com.sho1kat.client.impl;

import com.sho1kat.dto.ResumeServiceDto.request.ProjectRequest;
import com.sho1kat.dto.ResumeServiceDto.response.ProjectResponse;
import com.sho1kat.entity.Project;
import com.sho1kat.entity.Resume;
import com.sho1kat.exception.ApiException;
import com.sho1kat.mapper.ProjectMapper;
import com.sho1kat.repository.ProjectRepository;
import com.sho1kat.client.ProjectService;
import com.sho1kat.client.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ResumeService resumeService;
    private final ProjectRepository projectRepository;
    private final ProjectMapper projectMapper;

    @Override
    @Transactional
    public ProjectResponse addProject(Long resumeId, Long candidateId, ProjectRequest request) {
        Resume resume = resumeService.requireOwnedResume(resumeId, candidateId);
        validate(request);
        Project project = projectRepository.save(projectMapper.toEntity(resume, request));
        resumeService.refreshCompletionScore(resume);
        return projectMapper.toResponse(project);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjects(Long resumeId, Long candidateId) {
        Resume resume = resumeService.requireOwnedResume(resumeId, candidateId);
        return projectRepository.findByResumeIdOrderByDisplayOrderAscIdAsc(resume.getId())
                .stream()
                .map(projectMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ProjectResponse updateProject(Long projectId, Long resumeId, Long candidateId,
                                         ProjectRequest request) {
        Resume resume = resumeService.requireOwnedResume(resumeId, candidateId);
        Project project = requireProject(projectId, resume.getId());
        validate(request);
        projectMapper.updateEntity(request, project);
        Project saved = projectRepository.save(project);
        resumeService.refreshCompletionScore(resume);
        return projectMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteProject(Long projectId, Long resumeId, Long candidateId) {
        Resume resume = resumeService.requireOwnedResume(resumeId, candidateId);
        Project project = requireProject(projectId, resume.getId());
        projectRepository.delete(project);
        resumeService.refreshCompletionScore(resume);
    }

    // ---- helpers ----

    private Project requireProject(Long projectId, Long resumeId) {
        return projectRepository.findByIdAndResumeId(projectId, resumeId)
                .orElseThrow(() -> ApiException.notFound("Project not found with id: " + projectId));
    }

    /** An omitted endDate means ongoing; a supplied one must not precede the start. */
    private void validate(ProjectRequest request) {
        if (request.startDate() != null && request.endDate() != null
                && request.startDate().isAfter(request.endDate())) {
            throw ApiException.badRequest("endDate cannot be before startDate");
        }
    }
}
