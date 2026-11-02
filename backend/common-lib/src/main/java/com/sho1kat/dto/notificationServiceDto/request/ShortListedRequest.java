package com.sho1kat.dto.notificationServiceDto.request;

public record ShortListedRequest(
        String candidateName,
        String jobTitle,
        String companyName
) {
}
