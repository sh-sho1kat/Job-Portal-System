package com.sho1kat.dto.ResumeServiceDto.request;

import com.sho1kat.util.RegexPatterns;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record ProjectRequest(

        @NotBlank(message = "title is required")
        @Size(max = 150, message = "title must be at most 150 characters")
        String title,

        @Size(max = 10000, message = "description must be at most 10000 characters")
        String description,

        @Size(max = 30, message = "at most 30 technologies")
        List<@Size(max = 100, message = "each technology must be at most 100 characters") String> technologies,

        @Pattern(regexp = RegexPatterns.HTTP_URL, message = "projectUrl must be a http(s) URL")
        @Size(max = 500, message = "projectUrl must be at most 500 characters")
        String projectUrl,

        @Pattern(regexp = RegexPatterns.HTTP_URL, message = "sourceCodeUrl must be a http(s) URL")
        @Size(max = 500, message = "sourceCodeUrl must be at most 500 characters")
        String sourceCodeUrl,

        LocalDate startDate,

        /** Ongoing when omitted. */
        LocalDate endDate,

        Integer displayOrder
) {
}
