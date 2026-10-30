package com.sho1kat.dto;

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