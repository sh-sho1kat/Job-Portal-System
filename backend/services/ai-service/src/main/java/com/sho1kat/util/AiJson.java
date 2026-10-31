package com.sho1kat.util;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Robust JSON extraction from LLM output. Models occasionally wrap their JSON
 * in markdown fences or prepend an apology sentence — the parse below finds
 * the outermost JSON object wherever it hides.
 */
public final class AiJson {

    private static final ObjectMapper MAPPER = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    private AiJson() {
    }

    /** Parses model output into {@code type}, ignoring any prose around it. */
    public static <T> T parse(String raw, Class<T> type) {
        String candidate = extractJson(raw);
        try {
            return MAPPER.readValue(candidate, type);
        } catch (Exception e) {
            throw new IllegalArgumentException("AI returned malformed structured output", e);
        }
    }

    /** Strips markdown fences and surrounding prose, leaving the JSON object. */
    public static String extractJson(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("AI returned no structured content");
        }
        String text = raw.trim();

        if (text.startsWith("```")) {
            int firstLineBreak = text.indexOf('\n');
            int lastFence = text.lastIndexOf("```");
            if (firstLineBreak >= 0 && lastFence > firstLineBreak) {
                text = text.substring(firstLineBreak + 1, lastFence).trim();
            }
        }

        if (text.startsWith("{") && text.endsWith("}")) {
            return text;
        }

        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return text.substring(start, end + 1);
        }

        throw new IllegalArgumentException("No JSON object found in AI response");
    }
}
