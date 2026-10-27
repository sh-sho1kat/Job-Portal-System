package com.sho1kat.dto.ResumeServiceDto.request;

import com.sho1kat.enums.LanguageProficiency;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LanguageProficiencyRequest(

        @NotBlank(message = "languageName is required")
        @Size(max = 100, message = "languageName must be at most 100 characters")
        String languageName,

        @NotNull(message = "proficiency is required")
        LanguageProficiency proficiency,

        Integer displayOrder
) {
}
