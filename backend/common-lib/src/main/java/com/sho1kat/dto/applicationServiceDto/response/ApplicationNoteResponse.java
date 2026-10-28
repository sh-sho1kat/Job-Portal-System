package com.sho1kat.dto.applicationServiceDto.response;

import java.time.Instant;

public record ApplicationNoteResponse(
        Long id,
        Long addedByUserId,
        String content,
        Instant createdAt
) {
}
