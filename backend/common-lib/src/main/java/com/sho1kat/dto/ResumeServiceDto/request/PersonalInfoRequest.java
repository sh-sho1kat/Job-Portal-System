package com.sho1kat.dto.ResumeServiceDto.request;

import com.sho1kat.util.RegexPatterns;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PersonalInfoRequest(

        @Size(max = 100, message = "firstName must be at most 100 characters")
        String firstName,

        @Size(max = 100, message = "lastName must be at most 100 characters")
        String lastName,

        @Size(max = 150, message = "headline must be at most 150 characters")
        String headline,

        @Pattern(regexp = RegexPatterns.EMAIL_REGEX, message = "email must be a valid email address")
        @Size(max = 255, message = "email must be at most 255 characters")
        String email,

        @Pattern(regexp = RegexPatterns.PHONE_NUMBER_REGEX, message = "phone must be a valid phone number")
        @Size(max = 20, message = "phone must be at most 20 characters")
        String phone,

        @Size(max = 100, message = "city must be at most 100 characters")
        String city,

        @Size(max = 100, message = "country must be at most 100 characters")
        String country,

        @Pattern(regexp = RegexPatterns.HTTP_URL, message = "linkedInUrl must be a http(s) URL")
        @Size(max = 500, message = "linkedInUrl must be at most 500 characters")
        String linkedInUrl,

        @Pattern(regexp = RegexPatterns.HTTP_URL, message = "githubUrl must be a http(s) URL")
        @Size(max = 500, message = "githubUrl must be at most 500 characters")
        String githubUrl,

        @Pattern(regexp = RegexPatterns.HTTP_URL, message = "portfolioUrl must be a http(s) URL")
        @Size(max = 500, message = "portfolioUrl must be at most 500 characters")
        String portfolioUrl,

        @Pattern(regexp = RegexPatterns.HTTP_URL, message = "websiteUrl must be a http(s) URL")
        @Size(max = 500, message = "websiteUrl must be at most 500 characters")
        String websiteUrl
) {
}
