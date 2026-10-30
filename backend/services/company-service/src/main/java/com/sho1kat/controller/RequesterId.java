package com.sho1kat.controller;

import com.sho1kat.exception.ApiException;

/**
 * Resolves the caller's user id from the {@link #HEADER} request header.
 *
 * This is the identity transport for company-service: the API gateway verifies the JWT,
 * strips any client-sent X-User-* headers and then forwards these headers from
 * the token claims, so the value here is already the verified caller id. That
 * trust holds because only the gateway port is reachable in production; when a
 * developer hits this service directly (local debugging, Postman direct mode)
 * the header may be set manually. Ownership and role decisions taken on this
 * value are this service's own responsibility (the gateway does coarse rules).
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
