package com.sho1kat.mapper;

import com.sho1kat.dto.ResumeServiceDto.request.ProjectRequest;
import com.sho1kat.dto.ResumeServiceDto.response.ProjectResponse;
import com.sho1kat.entity.Project;
import com.sho1kat.entity.Resume;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ProjectMapper {

    public Project toEntity(Resume resume, ProjectRequest request) {
        return Project.builder()
                .resume(resume)
                .title(request.title().trim())
                .description(request.description())
                .technologies(cleanTechnologies(request.technologies()))
                .projectUrl(request.projectUrl())
                .sourceCodeUrl(request.sourceCodeUrl())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .displayOrder(request.displayOrder() == null ? 0 : request.displayOrder())
                .build();
    }

    public void updateEntity(ProjectRequest request, Project project) {
        project.setTitle(request.title().trim());
        project.setDescription(request.description());
        project.setTechnologies(cleanTechnologies(request.technologies()));
        project.setProjectUrl(request.projectUrl());
        project.setSourceCodeUrl(request.sourceCodeUrl());
        project.setStartDate(request.startDate());
        project.setEndDate(request.endDate());
        project.setDisplayOrder(request.displayOrder() == null ? 0 : request.displayOrder());
    }

    public ProjectResponse toResponse(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getTechnologies(),
                project.getProjectUrl(),
                project.getSourceCodeUrl(),
                project.getStartDate(),
                project.getEndDate(),
                project.isOngoing(),
                project.getDisplayOrder(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }

    private List<String> cleanTechnologies(List<String> technologies) {
        if (technologies == null) {
            return new ArrayList<>();
        }
        return technologies.stream()
                .filter(value -> value != null && !value.isBlank())
                .map(String::trim)
                .toList();
    }
}
