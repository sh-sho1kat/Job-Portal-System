package com.sho1kat.dto.ResumeServiceDto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record AwardRequest(

        @NotBlank(message = "title is required")
        @Size(max = 200, message = "title must be at most 200 characters")
        String title,

        @Size(max = 150, message = "issuer must be at most 150 characters")
        String issuer,

        @PastOrPresent(message = "date of award cannot be in the future")
        LocalDate dateAwarded,

        @Size(max = 5000, message = "description must be at most 5000 characters")
        String description,

        Integer displayOrder
) {
}
