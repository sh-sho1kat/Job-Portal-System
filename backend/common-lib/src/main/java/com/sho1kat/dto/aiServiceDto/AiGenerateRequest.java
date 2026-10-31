package com.sho1kat.dto.aiServiceDto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiGenerateRequest {

    @NotBlank(message = "Prompt cannot be empty")
    @Size(max = 20000, message = "Prompt cannot exceed 20000 characters")
    private String prompt;
}