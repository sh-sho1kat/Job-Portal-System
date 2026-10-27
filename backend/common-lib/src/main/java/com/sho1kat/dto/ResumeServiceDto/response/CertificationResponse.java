package com.sho1kat.dto.ResumeServiceDto.response;

import java.time.Instant;
import java.time.LocalDate;

public record CertificationResponse(
        Long id,
        String name,
        String issuingOrganization,
        LocalDate issueDate,
        LocalDate expirationDate,
        String credentialId,
        String credentialUrl,
        Integer displayOrder,
        Instant createdAt,
        Instant updatedAt
) {
}
