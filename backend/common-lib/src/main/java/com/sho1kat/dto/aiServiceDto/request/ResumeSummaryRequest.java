package com.sho1kat.dto.aiServiceDto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ResumeSummaryRequest(
        @Size(max = 150, message = "Target job title cannot exceed 150 characters")
        String targetJobTitle,

        @Min(value = 0, message = "Years of experience cannot be negative")
        @Max(value = 80, message = "Years of experience cannot exceed 80")
        Integer yearsOfExperience,

        @Valid
        @Size(max = 30, message = "At most 30 work experiences can be supplied")
        List<WorkExperienceInfo> workExperiences,

        @Size(max = 50, message = "At most 50 skills can be supplied")
        List<String> skills,

        @Valid
        @Size(max = 20, message = "At most 20 education entries can be supplied")
        List<EducationInfo> educations
) {

    public record WorkExperienceInfo(
            @Size(max = 150, message = "Job title cannot exceed 150 characters")
            String jobTitle,
            @Size(max = 150, message = "Company cannot exceed 150 characters")
            String company,
            @Size(max = 2000, message = "Description cannot exceed 2000 characters")
            String description
    ) {
    }

    public record EducationInfo(
            @Size(max = 100, message = "Degree cannot exceed 100 characters")
            String degree,
            @Size(max = 100, message = "Field of study cannot exceed 100 characters")
            String fieldOfStudy,
            @Size(max = 150, message = "Institution name cannot exceed 150 characters")
            String institutionName
    ) {
    }
}
