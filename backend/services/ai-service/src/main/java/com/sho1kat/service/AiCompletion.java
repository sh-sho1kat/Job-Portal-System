package com.sho1kat.service;

import com.sho1kat.client.AiPersona;
import com.sho1kat.client.AiProvider;
import com.sho1kat.exception.ApiException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Single entry point for AI content generation. Walks the registered
 * {@link AiProvider}s in priority order (Gemini, then Groq) and uses the first
 * one that is configured AND answers successfully — a rate-limited or
 * unreachable primary transparently falls through to the next. Only when every
 * provider fails does the caller see a {@code 503}.
 *
 * A {@code null} system instruction means the generic portal persona
 * ({@link AiPersona#DEFAULT}); feature endpoints always pass their own.
 */
@Slf4j
@Service
public class AiCompletion {

    private final List<AiProvider> providers;

    public AiCompletion(List<AiProvider> providers) {
        this.providers = List.copyOf(providers);
    }

    /** Free-text generation with automatic provider fallback. */
    public String text(String systemInstruction, String userPrompt) {
        String instruction = instructionOf(systemInstruction);
        List<String> failures = new ArrayList<>();
        ApiException lastFailure = null;
        for (AiProvider provider : providers) {
            if (!provider.isConfigured()) {
                continue;
            }
            try {
                return provider.generateText(instruction, userPrompt);
            } catch (ApiException e) {
                logProviderFailure(provider, "text", e);
                lastFailure = e;
                failures.add(provider.name());
            } catch (Exception e) {
                logProviderFailure(provider, "text", e);
                failures.add(provider.name());
            }
        }
        throw exhausted(failures, lastFailure, "text generation");
    }

    /** Structured generation (JSON) with automatic provider fallback. */
    public <T> T json(String systemInstruction, String userPrompt, Class<T> type) {
        String instruction = instructionOf(systemInstruction);
        List<String> failures = new ArrayList<>();
        ApiException lastFailure = null;
        for (AiProvider provider : providers) {
            if (!provider.isConfigured()) {
                continue;
            }
            try {
                return provider.generateJson(instruction, userPrompt, type);
            } catch (ApiException e) {
                logProviderFailure(provider, "json", e);
                lastFailure = e;
                failures.add(provider.name());
            } catch (Exception e) {
                logProviderFailure(provider, "json", e);
                failures.add(provider.name());
            }
        }
        throw exhausted(failures, lastFailure, "structured generation");
    }

    // ------------------------------------------------------------------ internals

    private static String instructionOf(String systemInstruction) {
        return systemInstruction != null ? systemInstruction : AiPersona.DEFAULT;
    }

    private static void logProviderFailure(AiProvider provider, String kind, Exception e) {
        log.warn("AI provider '{}' failed at {} ({}): {}",
                provider.name(), kind, e.getClass().getSimpleName(),
                e.getMessage() != null ? e.getMessage() : "no message");
    }

    /**
     * Every configured provider failed — or none was configured. When exactly
     * one provider was tried its own error (e.g. a 502 for malformed model
     * output) is re-raised as-is; several attempts collapse into one 503.
     */
    private static ApiException exhausted(List<String> tried, ApiException lastFailure, String kind) {
        if (tried.isEmpty()) {
            return ApiException.serviceUnavailable(
                    "No AI provider is configured; set GEMINI_API_KEY or GROQ_API_KEY");
        }
        if (tried.size() == 1 && lastFailure != null) {
            return new ApiException(lastFailure.getStatus(),
                    lastFailure.getMessage() + " (tried "
                            + String.join(", ", tried) + ")", lastFailure.getCause());
        }
        return ApiException.serviceUnavailable(
                "All AI providers (" + String.join(", ", tried) + ") failed during " + kind
                        + "; please retry shortly");
    }
}
