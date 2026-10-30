package com.sho1kat.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Verifies the gateway's token parsing against the exact claim shape user-service
 * writes: sub = user id, email, role = UserRole enum name (already ROLE_-prefixed).
 */
class JwtServiceTest {

    private static final String SECRET = "ZawcpoKYwCB8nlZp2YXPH5iP42mOLoH0JCuqI8wqREs=";
    private static final String ISSUER = "test-job-portal-user-service";

    private final JwtService jwtService = new JwtService(SECRET, ISSUER);

    /** Builds a token exactly the way user-service's JwtService does. */
    private String tokenFrom(Long userId, String email, String role, Instant issuedAt, Instant expiration) {
        return Jwts.builder()
                .issuer(ISSUER)
                .subject(String.valueOf(userId))
                .claim("email", email)
                .claim("role", role)
                .issuedAt(Date.from(issuedAt))
                .expiration(Date.from(expiration))
                .signWith(signingKey())
                .compact();
    }

    private static SecretKey signingKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(SECRET));
    }

    @Test
    void parsesVerifiedIdentityFromUserServiceClaims() {
        String token = tokenFrom(2001L, "candidate@example.com", "ROLE_JOB_SEEKER",
                Instant.now(), Instant.now().plusSeconds(600));

        AuthenticatedUser principal = jwtService.parseToken(token);

        assertThat(principal.id()).isEqualTo(2001L);
        assertThat(principal.email()).isEqualTo("candidate@example.com");
        assertThat(principal.role()).isEqualTo("ROLE_JOB_SEEKER");
        assertThat(jwtService.isTokenValid(token)).isTrue();
    }

    @Test
    void rejectsTokensSignedWithADifferentSecret() {
        // a token signed with some other key must not pass signature verification
        String forgedKeyBase64 = "dGhpcy1pcy1hLXZlcnktZGlmZmVyZW50LXNlY3JldC1rZXkhIQ==";
        String forgedToken = Jwts.builder()
                .issuer(ISSUER)
                .subject("999")
                .claim("role", "ROLE_SUPER_ADMIN")
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plusSeconds(600)))
                .signWith(Keys.hmacShaKeyFor(Decoders.BASE64.decode(forgedKeyBase64)))
                .compact();

        assertThat(jwtService.isTokenValid(forgedToken)).isFalse();
        assertThatThrownBy(() -> jwtService.parseToken(forgedToken)).isInstanceOf(io.jsonwebtoken.JwtException.class);
    }

    @Test
    void rejectsExpiredTokens() {
        String token = tokenFrom(2001L, "candidate@example.com", "ROLE_JOB_SEEKER",
                Instant.now().minusSeconds(1200), Instant.now().minusSeconds(600));

        assertThat(jwtService.isTokenValid(token)).isFalse();
        assertThatThrownBy(() -> jwtService.parseToken(token)).isInstanceOf(io.jsonwebtoken.JwtException.class);
    }

    @Test
    void rejectsTokensFromAnotherIssuer() {
        String token = Jwts.builder()
                .issuer("some-other-service")
                .subject("2001")
                .claim("role", "ROLE_ADMIN")
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plusSeconds(600)))
                .signWith(signingKey())
                .compact();

        assertThat(jwtService.isTokenValid(token)).isFalse();
    }
}
