package com.sho1kat.exception;

/**
 * Base exception for predictable REST API failures.
 *
 * Carries the HTTP status code the error should surface as, and is translated into a
 * consistent error payload by each service's {@code ApiExceptionHandler}. Deliberately
 * free of Spring Web dependencies so it can live in the shared common library.
 *
 * Prefer the static factories instead of hard-coding status literals:
 * <pre>
 *     throw ApiException.notFound("User not found with id: " + id);
 *     throw ApiException.conflict("Email is already registered");
 * </pre>
 */
public class ApiException extends RuntimeException {

    public static final int BAD_REQUEST = 400;
    public static final int UNAUTHORIZED = 401;
    public static final int FORBIDDEN = 403;
    public static final int NOT_FOUND = 404;
    public static final int CONFLICT = 409;
    public static final int SERVICE_UNAVAILABLE = 503;

    private final int status;

    public ApiException(int status, String message) {
        super(message);
        this.status = status;
    }

    public ApiException(int status, String message, Throwable cause) {
        super(message, cause);
        this.status = status;
    }

    public static ApiException badRequest(String message) {
        return new ApiException(BAD_REQUEST, message);
    }

    public static ApiException unauthorized(String message) {
        return new ApiException(UNAUTHORIZED, message);
    }

    public static ApiException forbidden(String message) {
        return new ApiException(FORBIDDEN, message);
    }

    public static ApiException notFound(String message) {
        return new ApiException(NOT_FOUND, message);
    }

    public static ApiException conflict(String message) {
        return new ApiException(CONFLICT, message);
    }

    public static ApiException serviceUnavailable(String message) {
        return new ApiException(SERVICE_UNAVAILABLE, message);
    }

    /** HTTP status code this exception maps to in responses. */
    public int getStatus() {
        return status;
    }
}
