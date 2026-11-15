package com.sho1kat.dto.ResumeServiceDto.request;

import com.sho1kat.embeddable.Address;
import com.sho1kat.enums.Gender;
import com.sho1kat.util.RegexPatterns;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PersonalInfoRequest(

        @Size(max = 100, message = "firstName must be at most 100 characters")
        @NotBlank(message = "firstName is required")
        String firstName,

        @Size(max = 100, message = "middleName must be at most 100 characters")
        String middleName,

        @Size(max = 100, message = "lastName must be at most 100 characters")
        @NotBlank(message = "lastName is required")
        String lastName,

        @Size(max = 150, message = "headline must be at most 150 characters")
        String headline,

        @Pattern(regexp = RegexPatterns.EMAIL_REGEX, message = "email must be a valid email address")
        @Size(max = 255, message = "email must be at most 255 characters")
        @NotBlank(message = "email is required")
        String email,

        @Pattern(regexp = RegexPatterns.PHONE_NUMBER_REGEX, message = "phone must be a valid phone number")
        @Size(max = 20, message = "phone must be at most 20 characters")
        @NotBlank(message = "phone is required")
        String phone,

        @NotBlank(message = "gender is required")
        Gender gender,

        @NotBlank(message = "nationality is required")
        @Size(max = 100, message = "nationality must be at most 100 characters")
        String nationality,

        @NotBlank(message = "dateOfBirth is required")
        @Pattern(regexp = "^(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])-\\d{4}$", message = "dateOfBirth must be in MM-dd-yyyy format")
        String dateOfBirth,

        @NotNull(message = "presentAddress is required")
        @Valid
        Address presentAddress,

        @NotNull(message = "permanentAddress is required")
        @Valid
        Address permanentAddress,

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
