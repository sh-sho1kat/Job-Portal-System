package com.sho1kat.config;

import com.sho1kat.security.RequesterContext;
import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Feign configuration for clients that call PUBLIC downstream endpoints acting
 * for the current caller (company-service /my-company ownership resolution).
 * Forwards the gateway-verified X-User-Id / X-User-Role. Deliberately NOT
 * applied to internal-token clients.
 */
public class RequesterForwardFeignConfig {

    @Bean
    public RequestInterceptor requesterForwardInterceptor() {
        return template -> {
            var attributes = RequestContextHolder.getRequestAttributes();
            if (!(attributes instanceof ServletRequestAttributes servletAttributes)) {
                return; // no active HTTP request on this thread
            }
            var request = servletAttributes.getRequest();
            String userId = request.getHeader(RequesterContext.HEADER);
            if (userId != null && !userId.isBlank()) {
                template.header(RequesterContext.HEADER, userId);
            }
            String role = request.getHeader(RequesterContext.ROLE_HEADER);
            if (role != null && !role.isBlank()) {
                template.header(RequesterContext.ROLE_HEADER, role);
            }
        };
    }
}