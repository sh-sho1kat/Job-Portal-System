package com.sho1kat.dto.aiServiceDto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiGenerateResponse {

    private String content;
    private String model;
}