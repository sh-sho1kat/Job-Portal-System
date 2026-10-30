package com.sho1kat.config;

import com.google.genai.Client;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
@EnableConfigurationProperties(GeminiProperties.class)
public class GeminiConfig {

    private final GeminiProperties properties;

    @Bean
    public Client geminiClient() {

        String apiKey = properties.getApi().getKey();

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "GEMINI_API_KEY is not configured"
            );
        }

        return Client.builder()
                .apiKey(apiKey)
                .build();
    }
}