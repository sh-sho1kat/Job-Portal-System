package com.sho1kat.client;

//Contract every AI backend in this service — Gemini first, Groq second
public interface AiProvider {

    String name();

    boolean isConfigured();

    String generateText(String systemInstruction, String userPrompt);

    <T> T generateJson(String systemInstruction, String userPrompt, Class<T> type);
}
