package com.sho1kat.config;

import feign.RequestInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

/**
 * Feign configuration for INTERNAL clients (user-service / resume-service).
 * Carries the service credential and deliberately does NOT forward X-User-Id /
 * X-User-Role — application-service decides who may see what, and must never
 * impersonate a candidate to get his data.
 *
 * This class is intentionally NOT @Configuration and lives outside component
 * scanning effects: it is only applied to clients that reference it via
 * @FeignClient(configuration = ...).
 */
public class InternalTokenFeignConfig {

    public static final String INTERNAL_TOKEN_HEADER = "X-Internal-Token";

    @Bean
    public RequestInterceptor internalTokenInterceptor(
            @Value("${INTERNAL_SERVICE_TOKEN:}") String internalServiceToken) {
        return template -> {
            if (internalServiceToken == null || internalServiceToken.isBlank()) {
                return; // fail-closed downstream: /internal/** rejects an unauthenticated call
            }
            template.header(INTERNAL_TOKEN_HEADER, internalServiceToken.trim());
        };
    }
}
