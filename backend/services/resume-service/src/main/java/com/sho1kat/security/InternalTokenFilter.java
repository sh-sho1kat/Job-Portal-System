package com.sho1kat.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@RequiredArgsConstructor
public class InternalTokenFilter extends OncePerRequestFilter {

    public static final String INTERNAL_TOKEN_HEADER = "X-Internal-Token";
    private static final String INTERNAL_PREFIX = "/internal/";

    private final String internalServiceToken;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        boolean internal = request.getRequestURI().startsWith(INTERNAL_PREFIX);
        String header = request.getHeader(INTERNAL_TOKEN_HEADER);
        boolean valid = header != null && !header.isBlank()
                && internalServiceToken != null && !internalServiceToken.isBlank()
                && header.trim().equals(internalServiceToken.trim());

        if (internal && !valid) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;
        }
        filterChain.doFilter(request, response);
    }
}
