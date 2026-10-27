package com.sho1kat.dto.ResumeServiceDto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record EducationRequest(

        @NotBlank(message = "institutionName is required")
        @Size(max = 150, message = "institutionName must be at most 150 characters")
        String institutionName,

        @NotBlank(message = "degree is required")
        @Size(max = 100, message = "degree must be at most 100 characters")
        String degree,

        @Size(max = 100, message = "fieldOfStudy must be at most 100 characters")
        String fieldOfStudy,

        @Size(max = 100, message = "grade must be at most 100 characters")
        String grade,

        @NotNull(message = "startDate is required")
        LocalDate startDate,

        LocalDate endDate,

        Boolean isCurrentlyStudying,

        @Size(max = 5000, message = "description must be at most 5000 characters")
        String description,

        Integer displayOrder
) {
}
