package com.sho1kat.dto.ResumeServiceDto.request;

import com.sho1kat.util.RegexPatterns;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CertificationRequest(

        @NotBlank(message = "name is required")
        @Size(max = 200, message = "name must be at most 200 characters")
        String name,

        @Size(max = 150, message = "issuingOrganization must be at most 150 characters")
        String issuingOrganization,

        @NotNull(message = "issueDate is required")
        LocalDate issueDate,

        LocalDate expirationDate,

        @Size(max = 255, message = "credentialId must be at most 255 characters")
        String credentialId,

        @Pattern(regexp = RegexPatterns.HTTP_URL, message = "credentialUrl must be a http(s) URL")
        @Size(max = 500, message = "credentialUrl must be at most 500 characters")
        String credentialUrl,

        Integer displayOrder
) {
}
