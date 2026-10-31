package com.sho1kat;

import com.sho1kat.exception.ApiException;
import com.sho1kat.service.AiCompletion;
import com.sho1kat.client.AiProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Boots the context without any AI keys (see test application.yaml) and checks
 * that the facade degrades into a clear 503 instead of failing startup.
 */
@SpringBootTest
class AiServiceApplicationTests {

    @Autowired
    private AiCompletion aiCompletion;

    @Autowired
    private List<AiProvider> providers;

    @Test
    void contextLoads() {
        assertThat(aiCompletion).isNotNull();
        // gemini (@Order 1) must come before groq (@Order 2) in the fallback chain
        assertThat(providers).hasSize(2);
        assertThat(providers.get(0).name()).isEqualTo("gemini");
        assertThat(providers.get(1).name()).isEqualTo("groq");
    }

    @Test
    void bothProvidersUnconfiguredWithoutKeys() {
        assertThat(providers).allSatisfy(provider -> assertThat(provider.isConfigured()).isFalse());
    }

    @Test
    void emptyKeyYields503Not500() {
        assertThatThrownBy(() -> aiCompletion.text(null, "Is Java good for remote jobs?"))
                .isInstanceOfSatisfying(ApiException.class,
                        ex -> assertThat(ex.getStatus()).isEqualTo(ApiException.SERVICE_UNAVAILABLE));

        assertThatThrownBy(() -> aiCompletion.json(null, "{}", JobAlertShadow.class))
                .isInstanceOfSatisfying(ApiException.class,
                        ex -> assertThat(ex.getStatus()).isEqualTo(ApiException.SERVICE_UNAVAILABLE));
    }

    /** Marker type for the JSON path — never parsed because no provider is configured. */
    private record JobAlertShadow(List<String> suggestedKeywords) {
    }
}
