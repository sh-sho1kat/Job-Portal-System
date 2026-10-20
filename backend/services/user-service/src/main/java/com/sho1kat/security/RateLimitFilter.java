package com.sho1kat.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Fixed-window per-client rate limiter for the unauthenticated auth endpoints
 * (login / register / refresh brute-force protection).
 * In-memory on purpose: a shared limiter belongs in the API gateway once one exists.
 */
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_TRACKED_CLIENTS = 10_000;

    private final String pathPrefix;
    private final long maxRequests;
    private final Duration window;

    private final ConcurrentHashMap<String, Window> counters = new ConcurrentHashMap<>();

    public RateLimitFilter(String pathPrefix, long maxRequests, Duration window) {
        this.pathPrefix = pathPrefix;
        this.maxRequests = maxRequests;
        this.window = window;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        if (!request.getRequestURI().startsWith(pathPrefix)) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientKey = clientKey(request);
        // loopback/unknown clients are still tracked; a null key only skips limiting
        if (clientKey == null) {
            filterChain.doFilter(request, response);
            return;
        }

        Window currentWindow = counters.compute(clientKey, (k, w) ->
                (w == null || isStale(w))
                        ? new Window(Instant.now().plus(window), new AtomicLong())
                        : w);

        if (currentWindow.count().incrementAndGet() > maxRequests) {
            long retryAfter = Math.max(1, Duration.between(Instant.now(), currentWindow.resetAt()).toSeconds());
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfter));
            return;
        }

        // keep the map bounded in case of many distinct (possibly spoofed) source addresses
        if (counters.size() > MAX_TRACKED_CLIENTS) {
            counters.values().removeIf(w -> isStale(w));
        }

        filterChain.doFilter(request, response);
    }

    private boolean isStale(Window w) {
        return w.resetAt().isBefore(Instant.now());
    }

    /**
     * Prefers the gateway-supplied X-Forwarded-For hop; note that the first hop is
     * client-controlled and must be trusted only when the service sits behind the gateway.
     */
    private String clientKey(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private record Window(Instant resetAt, AtomicLong count) {
    }
}
