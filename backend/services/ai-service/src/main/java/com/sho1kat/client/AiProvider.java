package com.sho1kat.client;

/**
 * Contract every AI backend in this service fulfils. Providers are Spring beans
 * ordered by {@code @Order} — Gemini first, Groq second — and the
 * {@link com.sho1kat.service.AiCompletion} facade walks them in that order,
 * falling back to the next provider whenever one is unconfigured or fails.
 *
 * Both methods receive their own system instruction; a provider must never
 * log the prompt body (it carries candidate / employer personal data).
 */
public interface AiProvider {

    /** Stable provider name used in log lines and error messages. */
    String name();

    /** Whether the required API key / configuration is present. */
    boolean isConfigured();

    /** Free-text generation: corporate-appropriate prose, no JSON guarantees. */
    String generateText(String systemInstruction, String userPrompt);

    /**
     * Structured generation: asks the backend for JSON only and deserialises
     * into {@code type}. Malformed model output is surfaced as a 502-level
     * {@link com.sho1kat.exception.ApiException} so the facade can fall back.
     */
    <T> T generateJson(String systemInstruction, String userPrompt, Class<T> type);
}
