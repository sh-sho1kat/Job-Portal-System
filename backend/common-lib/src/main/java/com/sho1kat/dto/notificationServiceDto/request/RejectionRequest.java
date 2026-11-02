package com.sho1kat.dto.notificationServiceDto.request;

public record RejectionRequest(
        String candidateName,
        String jobTitle,
        String companyName
) {
}
