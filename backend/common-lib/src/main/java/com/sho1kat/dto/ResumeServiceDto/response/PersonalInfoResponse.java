package com.sho1kat.dto.ResumeServiceDto.response;

import com.sho1kat.embeddable.Address;
import com.sho1kat.enums.Gender;

public record PersonalInfoResponse(
        String firstName,
        String middleName,
        String lastName,
        String headline,
        String email,
        String phone,
        Gender gender,
        String nationality,
        String dateOfBirth,
        Address presentAddress,
        Address permanentAddress,
        String linkedInUrl,
        String githubUrl,
        String portfolioUrl,
        String websiteUrl
) {
}
