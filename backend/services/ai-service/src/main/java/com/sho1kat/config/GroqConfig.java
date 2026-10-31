package com.sho1kat.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Registers {@link GroqProperties}. No REST client bean is built here —
 * {@link com.sho1kat.client.GroqClient} creates it lazily on first use, so a
 * service started without {@code GROQ_API_KEY} still boots and simply reports
 * the provider as unconfigured (facade falls back to Gemini).
 */
@Configuration(proxyBeanMethods = false)
@RequiredArgsConstructor
@EnableConfigurationProperties(GroqProperties.class)
public class GroqConfig {
}
