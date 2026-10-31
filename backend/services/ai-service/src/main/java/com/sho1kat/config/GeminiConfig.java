package com.sho1kat.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Registers {@link GeminiProperties}. No client bean is built here —
 * {@link com.sho1kat.client.GeminiClient} creates its SDK client lazily on
 * first use, so a service started without {@code GEMINI_API_KEY} still boots
 * and simply reports the provider as unconfigured (facade falls back to Groq).
 */
@Configuration(proxyBeanMethods = false)
@RequiredArgsConstructor
@EnableConfigurationProperties(GeminiProperties.class)
public class GeminiConfig {
}
