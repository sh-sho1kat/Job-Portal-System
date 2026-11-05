package com.sho1kat.config;

import com.sho1kat.security.InternalTokenFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class InternalTokenFilterConfig {

    @Bean
    public FilterRegistrationBean<InternalTokenFilter> internalTokenFilter(
            @Value("${app.internal.service-token:}") String internalServiceToken) {
        FilterRegistrationBean<InternalTokenFilter> registration = new FilterRegistrationBean<>(
                new InternalTokenFilter(internalServiceToken));
        registration.setUrlPatterns(List.of("/internal/*", "/*")); // guard the prefix, pass everything else
        // order: runs before the MVC dispatch; value chosen low so it precedes other filters
        registration.setOrder(0);
        return registration;
    }
}