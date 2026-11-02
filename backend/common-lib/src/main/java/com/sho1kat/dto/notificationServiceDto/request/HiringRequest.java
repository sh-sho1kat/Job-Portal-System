package com.sho1kat.dto.notificationServiceDto.request;

public record HiringRequest(
        String candidateName,
        String jobTitle,
        String companyName
) {
}
