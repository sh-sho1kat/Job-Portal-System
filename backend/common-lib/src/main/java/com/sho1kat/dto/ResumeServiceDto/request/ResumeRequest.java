package com.sho1kat.dto.ResumeServiceDto.request;

import com.sho1kat.enums.ResumeTemplateType;
import com.sho1kat.enums.ResumeVisibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResumeRequest(

        @NotBlank(message = "title is required")
        @Size(max = 150, message = "title must be at most 150 characters")
        String title,

        ResumeTemplateType template,

        ResumeVisibility visibility,

        Boolean isDefault
) {
}
