package com.sho1kat.controller;

import com.sho1kat.exception.ApiException;

/**
 * Resolves the caller's user id from the {@link #HEADER} request header.
 *
 * Temporary stand-in for JWT authentication in job-service: until security is
 * wired up here (or the API gateway validates tokens and forwards identity),
 * authenticated clients pass their user-service id in {@code X-User-Id}.
 */
final class RequesterId {

    static final String HEADER = "X-User-Id";

    private RequesterId() {
    }

    static Long from(String headerValue) {
        if (headerValue == null || headerValue.isBlank()) {
            throw ApiException.unauthorized("Authentication is required: missing " + HEADER + " header");
        }
        try {
            return Long.parseLong(headerValue.trim());
        } catch (NumberFormatException ex) {
            throw ApiException.unauthorized(HEADER + " must contain a numeric user id");
        }
    }
}
