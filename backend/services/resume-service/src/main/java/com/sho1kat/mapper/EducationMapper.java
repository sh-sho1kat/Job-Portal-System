package com.sho1kat.mapper;

import com.sho1kat.dto.ResumeServiceDto.request.EducationRequest;
import com.sho1kat.dto.ResumeServiceDto.response.EducationResponse;
import com.sho1kat.entity.Education;
import com.sho1kat.entity.Resume;
import org.springframework.stereotype.Component;

@Component
public class EducationMapper {

    public Education toEntity(Resume resume, EducationRequest request) {
        return Education.builder()
                .resume(resume)
                .institutionName(request.institutionName().trim())
                .degree(request.degree().trim())
                .fieldOfStudy(trim(request.fieldOfStudy()))
                .grade(trim(request.grade()))
                .startDate(request.startDate())
                .endDate(request.endDate())
                .isCurrentlyStudying(Boolean.TRUE.equals(request.isCurrentlyStudying()))
                .description(request.description())
                .displayOrder(request.displayOrder() == null ? 0 : request.displayOrder())
                .build();
    }

    public void updateEntity(EducationRequest request, Education education) {
        education.setInstitutionName(request.institutionName().trim());
        education.setDegree(request.degree().trim());
        education.setFieldOfStudy(trim(request.fieldOfStudy()));
        education.setGrade(trim(request.grade()));
        education.setStartDate(request.startDate());
        education.setEndDate(request.endDate());
        education.setIsCurrentlyStudying(Boolean.TRUE.equals(request.isCurrentlyStudying()));
        education.setDescription(request.description());
        education.setDisplayOrder(request.displayOrder() == null ? 0 : request.displayOrder());
    }

    public EducationResponse toResponse(Education education) {
        return new EducationResponse(
                education.getId(),
                education.getInstitutionName(),
                education.getDegree(),
                education.getFieldOfStudy(),
                education.getGrade(),
                education.getStartDate(),
                education.getEndDate(),
                education.getIsCurrentlyStudying(),
                education.getDescription(),
                education.getDisplayOrder(),
                education.getCreatedAt(),
                education.getUpdatedAt()
        );
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }
}
