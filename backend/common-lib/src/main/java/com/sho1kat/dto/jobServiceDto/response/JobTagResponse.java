package com.sho1kat.dto.jobServiceDto.response;

import java.time.Instant;

public record JobTagResponse(
        Long id,
        String name,
        String slug,
        Instant createdAt,
        Instant updatedAt
) {
}
