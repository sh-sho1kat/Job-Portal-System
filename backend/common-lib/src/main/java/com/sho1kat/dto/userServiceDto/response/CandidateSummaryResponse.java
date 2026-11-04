package com.sho1kat.dto.userServiceDto.response;

public record CandidateSummaryResponse(
        Long id,
        String firstName,
        String middleName,
        String lastName,
        String email,
        String phoneNumber,
        String profilePictureUrl
) {
}