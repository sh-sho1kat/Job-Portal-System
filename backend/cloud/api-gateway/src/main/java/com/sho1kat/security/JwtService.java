package com.sho1kat.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;

/**
 * Verifies access tokens issued by user-service.
 *
 * Claims written by user-service's com.sho1kat.security.JwtService when it signs
 * a token: "sub" (user id), "email", "role" (UserRole enum name) and the "iss"
 * issuer plus "exp" expiry. Verification fails — and tokens are rejected — when
 * the signature, issuer or expiry do not check out.
 *
 * The gateway and user-service must therefore be configured with the same
 * {@code app.jwt.secret} and {@code app.jwt.issuer} values.
 */
@Service
public class JwtService {

    private final SecretKey key;
    private final String issuer;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.issuer}") String issuer) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.issuer = issuer;
    }

    /**
     * Verifies signature, issuer and expiry; returns the verified identity.
     * Throws JwtException / IllegalArgumentException when the token is invalid.
     */
    public AuthenticatedUser parseToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .requireIssuer(issuer)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return new AuthenticatedUser(
                Long.valueOf(claims.getSubject()),
                claims.get("email", String.class),
                claims.get("role", String.class)
        );
    }

    /** Convenience check for callers that only need a pass/fail answer. */
    public boolean isTokenValid(String token) {
        try {
            parseToken(token);
            return true;
        } catch (io.jsonwebtoken.JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

}
