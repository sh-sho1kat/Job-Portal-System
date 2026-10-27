package com.sho1kat.dto.ResumeServiceDto.request;

import com.sho1kat.enums.EmploymentType;
import com.sho1kat.util.RegexPatterns;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;


public record WorkExperienceRequest(

        @NotBlank(message = "companyName is required")
        @Size(max = 150, message = "companyName must be at most 150 characters")
        String companyName,

        @Pattern(regexp = RegexPatterns.HTTP_URL, message = "companyLogoUrl must be a http(s) URL")
        @Size(max = 500, message = "companyLogoUrl must be at most 500 characters")
        String companyLogoUrl,

        @NotBlank(message = "position is required")
        @Size(max = 150, message = "position must be at most 150 characters")
        String position,

        EmploymentType employmentType,

        // Location map directly onto the job-service JobLocation embeddable
        @Size(max = 255, message = "address must be at most 255 characters")
        String address,

        @Size(max = 100, message = "city must be at most 100 characters")
        String city,

        @Size(max = 100, message = "state must be at most 100 characters")
        String state,

        @Size(max = 100, message = "country must be at most 100 characters")
        String country,

        @Size(max = 20, message = "zipCode must be at most 20 characters")
        String zipCode,

        @NotNull(message = "startDate is required")
        LocalDate startDate,

        /* Required when isCurrentJob is not true. */
        LocalDate endDate,

        Boolean isCurrentJob,

        @Size(max = 10000, message = "description must be at most 10000 characters")
        String description,

        @Size(max = 30, message = "at most 30 technologies")
        List<@Size(max = 100, message = "each technology must be at most 100 characters") String> technologies,

        Integer displayOrder
) {
}
