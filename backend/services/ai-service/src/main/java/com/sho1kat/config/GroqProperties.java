package com.sho1kat.config;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@NoArgsConstructor
@ConfigurationProperties(prefix = "groq")
public class GroqProperties {

    private String apiKey;
    private String baseUrl;
    private String model;
    private Integer maxCompletionTokens;
    private Float temperature;
    private String reasoningEffort;
}