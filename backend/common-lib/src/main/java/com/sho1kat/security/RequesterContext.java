package com.sho1kat.security;

import com.sho1kat.exception.ApiException;

// received the header from upstream api gateway, and parse it to get the user id of the requester
public final class RequesterContext {

    public static final String HEADER = "X-User-Id";

    private RequesterContext() {
    }

    public static Long from(String headerValue) {
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
