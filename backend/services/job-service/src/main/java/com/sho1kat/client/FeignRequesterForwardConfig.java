package com.sho1kat.client;

import com.sho1kat.security.RequesterContext;
import feign.Feign;
import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

//Forwards the gateway-injected headers onto service-to-service (Feign) calls.
@Configuration
public class FeignRequesterForwardConfig {

    private static final String USER_ROLE_HEADER = "X-User-Role";

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
            String role = request.getHeader(USER_ROLE_HEADER);
            if (role != null && !role.isBlank()) {
                template.header(USER_ROLE_HEADER, role);
            }
        };
    }
}
