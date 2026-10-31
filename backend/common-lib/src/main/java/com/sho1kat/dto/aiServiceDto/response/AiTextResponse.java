package com.sho1kat.dto.aiServiceDto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.Instant;

/**
 * Plain generated text plus a generation stamp.
 * `generatedAt` defaults to "now" when not supplied.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record AiTextResponse(
        String content,
        Instant generatedAt
) {

    public AiTextResponse {
        if (generatedAt == null) {
            generatedAt = Instant.now();
        }
    }

    public static AiTextResponse of(String content) {
        return new AiTextResponse(content, Instant.now());
    }
}
