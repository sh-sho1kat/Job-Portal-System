package com.sho1kat.dto.applicationServiceDto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ApplicationNoteRequest(
        @NotBlank(message = "Note content is required")
        @Size(max = 2000, message = "Note must not exceed 2000 characters")
        String content
) {
}
