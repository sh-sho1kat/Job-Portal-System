package com.sho1kat.dto.aiServiceDto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SearchEnhanceRequest(
        @NotBlank(message = "Query is required to search jobs")
        @Size(max = 500, message = "Query cannot exceed 500 characters")
        String query
) {
}
