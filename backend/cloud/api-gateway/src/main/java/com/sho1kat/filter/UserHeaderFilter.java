package com.sho1kat.filter;

import com.sho1kat.security.AuthenticatedUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.servlet.function.ServerRequest;

/**
 * Runs right before a request is proxied to a downstream service.
 *
 * 1. ALWAYS removes any X-User-Id / X-User-Email / X-User-Role headers sent by
 *    the client, so nobody can ever pose a fake identity.
 * 2. When the request carries an accepted JWT, sets them from the token claims.
 *
 * Downstream services then treat these headers as the caller's verified identity
 * and never parse the JWT themselves (the raw Authorization header is still
 * forwarded, so services that want to re-verify can).
 *
 * In production only the gateway should be reachable; the service ports are
 * internal. That is what makes this contract trustable end to end.
 */
public final class UserHeaderFilter {

    public static final String USER_ID_HEADER = "X-User-Id";
    public static final String USER_EMAIL_HEADER = "X-User-Email";
    public static final String USER_ROLE_HEADER = "X-User-Role";

    private UserHeaderFilter() {
    }

    public static ServerRequest addUserHeaders(ServerRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean verified = authentication != null
                && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof AuthenticatedUser;
        AuthenticatedUser principal = verified ? (AuthenticatedUser) authentication.getPrincipal() : null;

        return ServerRequest.from(request)
                .headers(headers -> {
                    headers.remove(USER_ID_HEADER);
                    headers.remove(USER_EMAIL_HEADER);
                    headers.remove(USER_ROLE_HEADER);

                    if (principal != null) {
                        headers.set(USER_ID_HEADER, String.valueOf(principal.id()));
                        if (principal.email() != null) {
                            headers.set(USER_EMAIL_HEADER, principal.email());
                        }
                        if (principal.role() != null) {
                            headers.set(USER_ROLE_HEADER, principal.role()); // e.g. ROLE_EMPLOYER
                        }
                    }
                })
                .build();
    }
}
