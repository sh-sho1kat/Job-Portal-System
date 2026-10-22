package com.sho1kat.dto.companyServiceDto.request;

import com.sho1kat.enums.CompanySize;
import com.sho1kat.enums.CompanyType;
import com.sho1kat.enums.IndustryType;
import com.sho1kat.util.RegexPatterns;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

public record UpdateCompanyRequest(
        @NotBlank(message = "name is required")
        @Size(max = 150, message = "name must be at most 150 characters")
        String name,

        @Size(max = 255, message = "tagline must be at most 255 characters")
        String tagline,

        @Size(max = 5000, message = "description must be at most 5000 characters")
        String description,

        @Size(max = 500) @Pattern(regexp = RegexPatterns.HTTP_URL, message = "logoUrl must be an http(s) URL")
        String logoUrl,

        @Size(max = 500) @Pattern(regexp = RegexPatterns.HTTP_URL, message = "coverImageUrl must be an http(s) URL")
        String coverImageUrl,

        @Size(max = 500) @Pattern(regexp = RegexPatterns.HTTP_URL, message = "website must be an http(s) URL")
        String website,

        @Size(max = 255) @Pattern(regexp = RegexPatterns.EMAIL_REGEX, message = "email must be a valid email address")
        String email,

        @Size(max = 20) @Pattern(regexp = RegexPatterns.PHONE_NUMBER_REGEX, message = "phone must be a valid phone number")
        String phone,

        @Min(value = 1800, message = "foundingYear is too far in the past")
        @Max(value = 2100, message = "foundingYear is invalid")
        Integer foundingYear,

        @NotNull(message = "companySize is required")
        CompanySize companySize,

        @NotNull(message = "companyType is required")
        CompanyType companyType,

        @NotNull(message = "industryType is required")
        IndustryType industryType,

        @Size(max = 10, message = "at most 10 social links")
        List<@Valid SocialLinkRequest> socialLinks
) {
}
