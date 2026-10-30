package com.sho1kat.service;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentConfig;
import com.sho1kat.config.GeminiProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GeminiService {

    private final Client geminiClient;
    private final GeminiProperties properties;

    public String generateContent(String prompt) {

        GenerateContentConfig config =
                GenerateContentConfig.builder()
                        .maxOutputTokens(properties.getMaxOutputTokens())
                        .temperature(properties.getTemperature())
                        .build();

        return geminiClient.models.generateContent(
                properties.getModel(),
                prompt,
                config
        ).text();
    }
}