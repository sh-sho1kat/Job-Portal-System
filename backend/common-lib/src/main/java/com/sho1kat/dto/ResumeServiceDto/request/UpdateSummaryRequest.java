package com.sho1kat.dto.ResumeServiceDto.request;

import jakarta.validation.constraints.Size;

public record UpdateSummaryRequest(

        @Size(max = 5000, message = "summary must be at most 5000 characters")
        String summary
) {
}
