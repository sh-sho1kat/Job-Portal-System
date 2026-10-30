package com.sho1kat.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record GroqChatRequest(
        String model,
        List<Message> messages,

        @JsonProperty("max_completion_tokens")
        Integer maxCompletionTokens,

        Float temperature,

        @JsonProperty("reasoning_effort")
        String reasoningEffort
) {

    public record Message(
            String role,
            String content
    ) {}
}