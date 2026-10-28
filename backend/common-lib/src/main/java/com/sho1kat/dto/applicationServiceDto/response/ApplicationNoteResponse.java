package com.sho1kat.dto.applicationServiceDto.response;

import java.time.Instant;

/**
 * One internal note on an application.
 */
public record ApplicationNoteResponse(
        Long id,
        Long addedByUserId,
        String content,
        Instant createdAt
) {
}
