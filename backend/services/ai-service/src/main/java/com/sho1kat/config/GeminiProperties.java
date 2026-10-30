package com.sho1kat.config;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@NoArgsConstructor
@ConfigurationProperties(prefix = "gemini")
public class GeminiProperties {

    private Api api;
    private String model;
    private Integer maxOutputTokens;
    private Float temperature;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Api {
        private String key;
    }
}