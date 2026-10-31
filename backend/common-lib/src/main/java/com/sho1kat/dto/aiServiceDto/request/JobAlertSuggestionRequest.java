package com.sho1kat.dto.aiServiceDto.request;

import jakarta.validation.constraints.Size;

import java.util.List;

public record JobAlertSuggestionRequest(
        @Size(max = 50, message = "At most 50 skills can be supplied")
        List<String> skills,

        @Size(max = 50, message = "Experience level cannot exceed 50 characters")
        String experienceLevel,

        @Size(max = 20, message = "At most 20 previous job titles can be supplied")
        List<String> previousJobTitles,

        @Size(max = 20, message = "At most 20 education entries can be supplied")
        List<String> educations
) {
}
