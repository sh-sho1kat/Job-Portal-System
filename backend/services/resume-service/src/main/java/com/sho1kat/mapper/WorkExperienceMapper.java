package com.sho1kat.mapper;

import com.sho1kat.dto.ResumeServiceDto.request.WorkExperienceRequest;
import com.sho1kat.dto.ResumeServiceDto.response.WorkExperienceResponse;
import com.sho1kat.embeddable.JobLocation;
import com.sho1kat.entity.Resume;
import com.sho1kat.entity.WorkExperience;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class WorkExperienceMapper {

    public WorkExperience toEntity(Resume resume, WorkExperienceRequest request) {
        return WorkExperience.builder()
                .resume(resume)
                .companyName(request.companyName().trim())
                .companyLogoUrl(request.companyLogoUrl())
                .position(request.position().trim())
                .employmentType(request.employmentType())
                .location(toLocation(request))
                .startDate(request.startDate())
                .endDate(request.endDate())
                .isCurrentJob(Boolean.TRUE.equals(request.isCurrentJob()))
                .description(request.description())
                .technologies(cleanTechnologies(request.technologies()))
                .displayOrder(request.displayOrder() == null ? 0 : request.displayOrder())
                .build();
    }

    public void updateEntity(WorkExperienceRequest request, WorkExperience experience) {
        experience.setCompanyName(request.companyName().trim());
        experience.setCompanyLogoUrl(request.companyLogoUrl());
        experience.setPosition(request.position().trim());
        experience.setEmploymentType(request.employmentType());
        experience.setLocation(toLocation(request));
        experience.setStartDate(request.startDate());
        experience.setEndDate(request.endDate());
        experience.setIsCurrentJob(Boolean.TRUE.equals(request.isCurrentJob()));
        experience.setDescription(request.description());
        experience.setTechnologies(cleanTechnologies(request.technologies()));
        experience.setDisplayOrder(request.displayOrder() == null ? 0 : request.displayOrder());
    }

    public WorkExperienceResponse toResponse(WorkExperience experience) {
        JobLocation location = experience.getLocation();
        return new WorkExperienceResponse(
                experience.getId(),
                experience.getCompanyName(),
                experience.getCompanyLogoUrl(),
                experience.getPosition(),
                experience.getEmploymentType(),
                location == null ? null : location.getAddress(),
                location == null ? null : location.getCity(),
                location == null ? null : location.getState(),
                location == null ? null : location.getCountry(),
                location == null ? null : location.getZipCode(),
                experience.getStartDate(),
                experience.getEndDate(),
                experience.getIsCurrentJob(),
                experience.getDescription(),
                experience.getTechnologies(),
                experience.getDisplayOrder(),
                experience.getCreatedAt(),
                experience.getUpdatedAt()
        );
    }

    private JobLocation toLocation(WorkExperienceRequest request) {
        return JobLocation.builder()
                .address(request.address())
                .city(request.city())
                .state(request.state())
                .country(request.country())
                .zipCode(request.zipCode())
                .build();
    }

    private List<String> cleanTechnologies(List<String> technologies) {
        if (technologies == null) {
            return new java.util.ArrayList<>();
        }
        return technologies.stream()
                .filter(value -> value != null && !value.isBlank())
                .map(String::trim)
                .toList();
    }
}
