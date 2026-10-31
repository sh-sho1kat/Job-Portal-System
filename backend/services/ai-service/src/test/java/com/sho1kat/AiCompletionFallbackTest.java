package com.sho1kat;

import com.sho1kat.client.AiProvider;
import com.sho1kat.dto.aiServiceDto.response.CareerFeedbackResponse;
import com.sho1kat.dto.aiServiceDto.response.JobAlertSuggestionResponse;
import com.sho1kat.dto.aiServiceDto.response.SearchEnhanceResponse;
import com.sho1kat.dto.aiServiceDto.response.ScreeningScoreResponse;
import com.sho1kat.exception.ApiException;
import com.sho1kat.service.AiCompletion;
import com.sho1kat.util.AiJson;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Provider-fallback orchestration and malformed-output handling, exercised
 * with hand-written {@link AiProvider} stubs (no network, no API keys).
 */
class AiCompletionFallbackTest {

    // ------------------------------------------------------------------ stubs

    /** Hand-rolled provider: configurable health + JSON validity, echoes name. */
    private static class StubProvider implements AiProvider {

        private final String name;
        private final boolean configured;
        private final boolean jsonValid;

        StubProvider(String name, boolean configured, boolean jsonValid) {
            this.name = name;
            this.configured = configured;
            this.jsonValid = jsonValid;
        }

        static StubProvider healthy(String name) {
            return new StubProvider(name, true, true);
        }

        @Override
        public String name() {
            return name;
        }

        @Override
        public boolean isConfigured() {
            return configured;
        }

        @Override
        public String generateText(String systemInstruction, String userPrompt) {
            if (!configured) {
                throw ApiException.serviceUnavailable("provider not configured");
            }
            return name + "::text::" + userPrompt;
        }

        @Override
        public <T> T generateJson(String systemInstruction, String userPrompt, Class<T> type) {
            if (!configured) {
                throw ApiException.serviceUnavailable("provider not configured");
            }
            if (!jsonValid) {
                throw new ApiException(502, name + " returned malformed structured output");
            }
            return AiJson.parse("{\"score\": 77, \"summary\": \"solid fit\"}", type);
        }
    }

    private final AiProvider healthyGemini = StubProvider.healthy("gemini");
    // fails at the call level (rate limit / downtime)
    private final AiProvider downGemini = new StubProvider("gemini", true, true) {
        @Override
        public String generateText(String systemInstruction, String userPrompt) {
            throw ApiException.serviceUnavailable("gemini down");
        }
    };
    // answers, but never with JSON
    private final AiProvider chattyGemini = new StubProvider("gemini", true, false) {
        @Override
        public String generateText(String systemInstruction, String userPrompt) {
            return "I am afraid I cannot produce structured output for that.";
        }
    };
    private final AiProvider healthyGroq = StubProvider.healthy("groq");
    private final AiProvider unconfiguredGroq = new StubProvider("groq", false, true);

    // --------------------------------------------------------------- ordering

    @Test
    void firstConfiguredProviderWins() {
        AiCompletion completion = new AiCompletion(List.of(healthyGemini, healthyGroq));

        assertThat(completion.text(null, "hello")).isEqualTo("gemini::text::hello");
    }

    @Test
    void unconfiguredProviderIsSkipped() {
        AiCompletion completion = new AiCompletion(List.of(healthyGemini, unconfiguredGroq));

        assertThat(completion.text(null, "hello")).isEqualTo("gemini::text::hello");
    }

    // --------------------------------------------------------------- fallback

    @Test
    void fallsBackToNextProviderWhenPrimaryIsDown() {
        AiCompletion completion = new AiCompletion(List.of(downGemini, healthyGroq));

        assertThat(completion.text(null, "hello")).isEqualTo("groq::text::hello");
    }

    @Test
    void malformedJsonFallsBackToNextProvider() {
        AiCompletion completion = new AiCompletion(List.of(chattyGemini, healthyGroq));

        ScreeningScoreResponse parsed = completion.json(null, "score", ScreeningScoreResponse.class);
        assertThat(parsed.score()).isEqualTo(77);
        assertThat(parsed.summary()).isEqualTo("solid fit");
    }

    @Test
    void allProvidersFailingYields503NamingThem() {
        AiProvider downGroq = new StubProvider("groq", true, true) {
            @Override
            public String generateText(String systemInstruction, String userPrompt) {
                throw ApiException.serviceUnavailable("groq down");
            }
        };
        AiCompletion completion = new AiCompletion(List.of(downGemini, downGroq, unconfiguredGroq));

        assertThatThrownBy(() -> completion.text(null, "hello"))
                .isInstanceOfSatisfying(ApiException.class, ex -> {
                    assertThat(ex.getStatus()).isEqualTo(ApiException.SERVICE_UNAVAILABLE);
                    assertThat(ex.getMessage()).contains("gemini").contains("groq");
                });
    }

    @Test
    void noProviderRegisteredYields503() {
        AiCompletion completion = new AiCompletion(List.of());

        assertThatThrownBy(() -> completion.text(null, "hello"))
                .isInstanceOfSatisfying(ApiException.class, ex -> {
                    assertThat(ex.getStatus()).isEqualTo(ApiException.SERVICE_UNAVAILABLE);
                    assertThat(ex.getMessage()).contains("No AI provider is configured");
                });
    }

    // ------------------------------------------------- typed JSON decode path

    @Test
    void jsonDecodesIntoEachTargetType() {
        AiCompletion completion = new AiCompletion(List.of(healthyGemini));

        ScreeningScoreResponse screening = completion.json(null, "score", ScreeningScoreResponse.class);
        CareerFeedbackResponse feedback = completion.json(null, "feedback", CareerFeedbackResponse.class);
        SearchEnhanceResponse search = completion.json(null, "search", SearchEnhanceResponse.class);

        assertThat(screening.score()).isEqualTo(77);
        assertThat(feedback).isNotNull();
        assertThat(search).isNotNull();
    }

    // ------------------------------------------------------- persona plumbing

    @Test
    void nullSystemInstructionIsAccepted() {
        AiCompletion completion = new AiCompletion(List.of(healthyGemini));

        assertThat(completion.text(null, "salary?")).isEqualTo("gemini::text::salary?");
        assertThat(completion.text("""
                Strict persona
                """, "salary?")).isEqualTo("gemini::text::salary?");
    }

    @Test
    void nonJsonOutputSurfaces502AfterExhaustingFallbacks() {
        AiCompletion completion = new AiCompletion(List.of(chattyGemini));

        assertThatThrownBy(() -> completion.json(null, "x", JobAlertSuggestionResponse.class))
                .isInstanceOfSatisfying(ApiException.class,
                        ex -> assertThat(ex.getStatus()).isEqualTo(502));
    }
}
