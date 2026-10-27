package com.sho1kat.dto.ResumeServiceDto.response;

import com.sho1kat.enums.EmploymentType;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record WorkExperienceResponse(
        Long id,
        String companyName,
        String companyLogoUrl,
        String position,
        EmploymentType employmentType,
        String address,
        String city,
        String state,
        String country,
        String zipCode,
        LocalDate startDate,
        LocalDate endDate,
        Boolean isCurrentJob,
        String description,
        List<String> technologies,
        Integer displayOrder,
        Instant createdAt,
        Instant updatedAt
) {
}
