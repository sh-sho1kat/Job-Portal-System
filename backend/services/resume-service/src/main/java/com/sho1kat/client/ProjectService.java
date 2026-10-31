package com.sho1kat.client;

import com.sho1kat.dto.ResumeServiceDto.request.ProjectRequest;
import com.sho1kat.dto.ResumeServiceDto.response.ProjectResponse;

import java.util.List;

public interface ProjectService {

    ProjectResponse addProject(Long resumeId, Long candidateId, ProjectRequest request);

    List<ProjectResponse> getProjects(Long resumeId, Long candidateId);

    ProjectResponse updateProject(Long projectId, Long resumeId, Long candidateId, ProjectRequest request);

    void deleteProject(Long projectId, Long resumeId, Long candidateId);
}
