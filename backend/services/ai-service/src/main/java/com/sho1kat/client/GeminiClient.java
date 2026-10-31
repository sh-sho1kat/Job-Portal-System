package com.sho1kat.client;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import com.sho1kat.config.GeminiProperties;
import com.sho1kat.dto.aiServiceDto.AiGenerateRequest;
import com.sho1kat.dto.aiServiceDto.AiGenerateResponse;
import com.sho1kat.exception.ApiException;
import com.sho1kat.util.AiJson;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * Google Gemini backend, built on the official genai SDK. The SDK client is
 * created lazily on first use so a missing {@code GEMINI_API_KEY} does not
 * break boot — calls simply answer {@code 503 unconfigured} and the facade
 * falls back to Groq.
 */
@Slf4j
@Service
@Order(1)
@RequiredArgsConstructor
public class GeminiClient implements AiProvider {

    private final GeminiProperties properties;

    private volatile Client client;

    @Override
    public String name() {
        return "gemini";
    }

    @Override
    public boolean isConfigured() {
        return properties.getApi() != null
                && StringUtils.hasText(properties.getApi().getKey());
    }

    /** Open-ended playground path — keeps the generic portal persona. */
    public AiGenerateResponse generateContent(AiGenerateRequest request) {
        return AiGenerateResponse.builder()
                .content(generateText(null, request.getPrompt()))
                .model(properties.getModel())
                .build();
    }

    @Override
    public String generateText(String systemInstruction, String userPrompt) {
        String instruction = systemInstruction != null ? systemInstruction : AiPersona.DEFAULT;
        return request(userPrompt, textConfig(instruction));
    }

    @Override
    public <T> T generateJson(String systemInstruction, String userPrompt, Class<T> type) {
        String instruction = systemInstruction != null ? systemInstruction : AiPersona.DEFAULT;
        String content = request(userPrompt, jsonConfig(instruction));
        try {
            return AiJson.parse(content, type);
        } catch (IllegalArgumentException e) {
            log.error("Gemini returned malformed structured output (model {}): {}", properties.getModel(), content);
            throw new ApiException(502, "Gemini returned malformed structured output");
        }
    }

    // ------------------------------------------------------------------ internals

    private String request(String userPrompt, GenerateContentConfig config) {
        if (!isConfigured()) {
            throw ApiException.serviceUnavailable("Gemini is not configured (missing GEMINI_API_KEY)");
        }
        try {
            GenerateContentResponse response = client().models.generateContent(
                    properties.getModel(),
                    userPrompt,
                    config);

            String content = response.text();
            if (content == null || content.isBlank()) {
                throw new IllegalStateException("Gemini returned an empty response");
            }
            return content;

        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Gemini content generation failed (model {})", properties.getModel(), e);
            throw ApiException.serviceUnavailable("Gemini is temporarily unavailable");
        }
    }

    private GenerateContentConfig textConfig(String instruction) {
        return GenerateContentConfig.builder()
                .maxOutputTokens(properties.getMaxOutputTokens())
                .temperature(properties.getTemperature())
                .systemInstruction(Content.fromParts(Part.fromText(instruction)))
                .build();
    }

    private GenerateContentConfig jsonConfig(String instruction) {
        return GenerateContentConfig.builder()
                .maxOutputTokens(properties.getMaxOutputTokens())
                .temperature(properties.getTemperature())
                .systemInstruction(Content.fromParts(Part.fromText(instruction)))
                .responseMimeType("application/json")
                .build();
    }

    private Client client() {
        if (client == null) {
            synchronized (this) {
                if (client == null) {
                    client = Client.builder().apiKey(properties.getApi().getKey()).build();
                }
            }
        }
        return client;
    }
}
