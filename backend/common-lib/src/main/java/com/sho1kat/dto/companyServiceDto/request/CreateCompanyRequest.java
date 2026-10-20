package com.sho1kat.dto.companyServiceDto.request;

import com.sho1kat.enums.CompanySize;
import com.sho1kat.enums.CompanyType;
import com.sho1kat.enums.IndustryType;
import com.sho1kat.util.RegexPatterns;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

public record CreateCompanyRequest(
        @NotBlank(message = "name is required")
        @Size(max = 150, message = "name must be at most 150 characters")
        String name,

        @Size(max = 255, message = "tagline must be at most 255 characters")
        String tagline,

        @Size(max = 5000, message = "description must be at most 5000 characters")
        String description,

        @Size(max = 500) @Pattern(regexp = RegexPatterns.HTTP_URL, message = "logoUrl must be a valid URL")
        String logoUrl,

        @Size(max = 500) @Pattern(regexp = RegexPatterns.HTTP_URL, message = "coverImageUrl must be a valid URL")
        String coverImageUrl,

        @Size(max = 500) @Pattern(regexp = RegexPatterns.HTTP_URL, message = "website must be a valid URL")
        String website,

        @Min(value = 1800, message = "foundedYear is too far in the past")
        @Max(value = 2100, message = "foundedYear is invalid")
        Integer foundingYear,

        @NotNull(message = "companySize is required")
        CompanySize companySize,

        @NotNull(message = "companyType is required")
        CompanyType companyType,

        @NotNull(message = "industryType is required")
        IndustryType industryType,

        @Size(max = 100, message = "registrationNumber must be at most 100 characters")
        String registrationNumber,

        @Size(max = 10, message = "at most 10 social links")
        List<@Valid SocialLinkRequest> socialLinks
) {
}
