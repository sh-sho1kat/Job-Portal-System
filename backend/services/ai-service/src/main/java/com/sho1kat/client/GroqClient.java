package com.sho1kat.client;

import com.sho1kat.config.GroqProperties;
import com.sho1kat.dto.aiServiceDto.AiGenerateRequest;
import com.sho1kat.dto.aiServiceDto.AiGenerateResponse;
import com.sho1kat.dto.aiServiceDto.groq.GroqChatRequest;
import com.sho1kat.dto.aiServiceDto.groq.GroqChatResponse;
import com.sho1kat.exception.ApiException;
import com.sho1kat.util.AiJson;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.List;

/**
 * Groq backend (OpenAI-compatible chat completions). The REST client is built
 * lazily on first use so a missing {@code GROQ_API_KEY} does not break boot —
 * calls answer {@code 503 unconfigured} and the facade falls back to Gemini.
 */
@Slf4j
@Service
@Order(2)
@RequiredArgsConstructor
public class GroqClient implements AiProvider {

    private final GroqProperties properties;

    private volatile RestClient restClient;

    @Override
    public String name() {
        return "groq";
    }

    @Override
    public boolean isConfigured() {
        return StringUtils.hasText(properties.getApiKey())
                && StringUtils.hasText(properties.getBaseUrl());
    }

    /** Open-ended playground path — keeps the generic portal persona. */
    public AiGenerateResponse generateContent(AiGenerateRequest request) {
        String content = generateText(null, request.getPrompt());
        return AiGenerateResponse.builder()
                .content(content)
                .model(properties.getModel())
                .build();
    }

    @Override
    public String generateText(String systemInstruction, String userPrompt) {
        String instruction = systemInstruction != null ? systemInstruction : AiPersona.DEFAULT;

        GroqChatRequest chatRequest = new GroqChatRequest(
                properties.getModel(),
                List.of(
                        new GroqChatRequest.Message("system", instruction),
                        new GroqChatRequest.Message("user", userPrompt)
                ),
                properties.getMaxCompletionTokens(),
                properties.getTemperature(),
                properties.getReasoningEffort()
        );

        try {
            GroqChatResponse response = client().post()
                    .uri("/chat/completions")
                    .body(chatRequest)
                    .retrieve()
                    .body(GroqChatResponse.class);

            if (response == null || response.choices() == null || response.choices().isEmpty()
                    || response.choices().getFirst().message() == null) {
                throw new IllegalStateException("Groq returned an empty response");
            }

            String content = response.choices().getFirst().message().content();
            if (content == null || content.isBlank()) {
                throw new IllegalStateException("Groq returned empty content");
            }
            return content;

        } catch (ApiException e) {
            throw e;
        } catch (RestClientResponseException e) {
            log.error("Groq API failed. HTTP status: {}, response: {}",
                    e.getStatusCode().value(), e.getResponseBodyAsString());
            int status = e.getStatusCode().value();
            if (status == 429 || status >= 500) {
                throw ApiException.serviceUnavailable("Groq is temporarily unavailable (rate limited or downtime)");
            }
            throw new ApiException(502, "Groq rejected the request (HTTP " + status + ")");
        } catch (Exception e) {
            log.error("Groq content generation failed (model {})", properties.getModel(), e);
            throw ApiException.serviceUnavailable("Groq is temporarily unavailable");
        }
    }

    @Override
    public <T> T generateJson(String systemInstruction, String userPrompt, Class<T> type) {
        String content = generateText(systemInstruction, userPrompt);
        try {
            return AiJson.parse(content, type);
        } catch (IllegalArgumentException e) {
            log.error("Groq returned malformed structured output (model {}): {}", properties.getModel(), content);
            throw new ApiException(502, "Groq returned malformed structured output");
        }
    }

    // ------------------------------------------------------------------ internals

    private RestClient client() {
        if (!isConfigured()) {
            throw ApiException.serviceUnavailable("Groq is not configured (missing GROQ_API_KEY)");
        }
        if (restClient == null) {
            synchronized (this) {
                if (restClient == null) {
                    HttpClient httpClient = HttpClient.newBuilder()
                            .connectTimeout(Duration.ofSeconds(10))
                            .build();
                    restClient = RestClient.builder()
                            .baseUrl(properties.getBaseUrl())
                            .requestFactory(new JdkClientHttpRequestFactory(httpClient))
                            .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + properties.getApiKey())
                            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                            .build();
                }
            }
        }
        return restClient;
    }
}
