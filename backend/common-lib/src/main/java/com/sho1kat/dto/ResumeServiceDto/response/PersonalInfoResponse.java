package com.sho1kat.dto.ResumeServiceDto.response;

public record PersonalInfoResponse(
        String firstName,
        String lastName,
        String headline,
        String email,
        String phone,
        String city,
        String country,
        String linkedInUrl,
        String githubUrl,
        String portfolioUrl,
        String websiteUrl
) {
}
