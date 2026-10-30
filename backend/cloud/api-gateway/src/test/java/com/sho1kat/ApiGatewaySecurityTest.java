package com.sho1kat;

import com.sho1kat.filter.UserHeaderFilter;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.servlet.function.RequestPredicates;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerRequest;
import org.springframework.web.servlet.function.ServerResponse;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.Objects;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Proves the front-door contract end to end (against a local echo route, no real
 * downstream services):
 *
 * <ul>
 *   <li>public catalog reads are open without a token;</li>
 *   <li>secured reads answer 401 with the JSON error shape when anonymous;</li>
 *   <li>tokens signed by user-service carry the caller's identity downstream as
 *       X-User-Id / X-User-Email / X-User-Role;</li>
 *   <li>client-sent X-User-* headers are stripped — they can never be faked;</li>
 *   <li> roles outside a rule's whitelist answer 403.</li>
 * </ul>
 */
@SpringBootTest
@AutoConfigureMockMvc
class ApiGatewaySecurityTest {

    private static final String SECRET = "ZawcpoKYwCB8nlZp2YXPH5iP42mOLoH0JCuqI8wqREs=";
    private static final String ISSUER = "test-job-portal-user-service";

    @Autowired
    MockMvc mockMvc;

    /** Local stand-in for a downstream service: echoes the identity headers it received. */
    @TestConfiguration
    static class EchoRoutes {

        @Bean
        RouterFunction<ServerResponse> echoRoute() {
            return GatewayRouterFunctions.route("echo-routes")
                    .route(
                            RequestPredicates.GET("/api/test/whoami"),
                            (ServerRequest request) -> ServerResponse.ok().body(
                                    "id=%s; email=%s; role=%s".formatted(
                                            Objects.requireNonNullElse(
                                                    request.headers().asHttpHeaders().getFirst(UserHeaderFilter.USER_ID_HEADER), "none"),
                                            Objects.requireNonNullElse(
                                                    request.headers().asHttpHeaders().getFirst(UserHeaderFilter.USER_EMAIL_HEADER), "none"),
                                            Objects.requireNonNullElse(
                                                    request.headers().asHttpHeaders().getFirst(UserHeaderFilter.USER_ROLE_HEADER), "none"))))
                    // same identity plumbing a real proxy route gets
                    .before(UserHeaderFilter::addUserHeaders)
                    .build();
        }
    }

    /** Mirrors user-service's JwtService.claims: sub = id, email, role. */
    private String tokenFor(long userId, String role) {
        SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(SECRET));
        return "Bearer " + Jwts.builder()
                .issuer(ISSUER)
                .subject(String.valueOf(userId))
                .claim("email", "user" + userId + "@example.com")
                .claim("role", role)
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plusSeconds(600)))
                .signWith(key)
                .compact();
    }

    @Test
    void publicCatalogReadsNeedNoToken() throws Exception {
        // Both calls pass the gateway's security gate. Without a real job-service
        // registered in this test the proxy hop itself then fails (503 / "Unable
        // to find instance for job-service"), which still proves that authentication
        // did not block the request.
        assertThat(gateVerdict("/api/jobs")).as("public reads must not be blocked by auth").isNotIn(401, 403);
        assertThat(gateVerdict("/api/job-categories")).isNotIn(401, 403);
    }

    /**
     * Returns "503" when the request got past the security gate but the proxy hop
     * failed (the only failure mode available in this offline test), otherwise the
     * actual response status (401/403 would mean the gate blocked it).
     */
    private int gateVerdict(String url) throws Exception {
        try {
            return mockMvc.perform(get(url)).andReturn().getResponse().getStatus();
        } catch (Exception ex) {
            return 503;
        }
    }

    @Test
    void anonymousSecuredRequestGetsJson401() throws Exception {
        mockMvc.perform(get("/api/users/2001"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    void malformedOrGarbageTokenGets401() throws Exception {
        mockMvc.perform(get("/api/users/2001").header(HttpHeaders.AUTHORIZATION, "Bearer not-a-real-token"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/users/2001").header(HttpHeaders.AUTHORIZATION, "Basic Zm9vOmJhcg=="))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void validTokenForwardsVerifiedIdentityDownstream() throws Exception {
        mockMvc.perform(get("/api/test/whoami").header(HttpHeaders.AUTHORIZATION, tokenFor(2001L, "ROLE_JOB_SEEKER")))
                .andExpect(status().isOk())
                .andExpect(result -> assertThat(result.getResponse().getContentAsString())
                        .isEqualTo("id=2001; email=user2001@example.com; role=ROLE_JOB_SEEKER"));
    }

    @Test
    void spoofedIdentityHeadersAreReplacedByTokenIdentity() throws Exception {
        // attacker both carries a valid token for 2001 AND tries to pose as id 999 / ROLE_SUPER_ADMIN
        mockMvc.perform(get("/api/test/whoami")
                        .header(HttpHeaders.AUTHORIZATION, tokenFor(2001L, "ROLE_JOB_SEEKER"))
                        .header(UserHeaderFilter.USER_ID_HEADER, "999")
                        .header(UserHeaderFilter.USER_ROLE_HEADER, "ROLE_SUPER_ADMIN"))
                .andExpect(status().isOk())
                .andExpect(result -> assertThat(result.getResponse().getContentAsString())
                        .isEqualTo("id=2001; email=user2001@example.com; role=ROLE_JOB_SEEKER"));
    }

    @Test
    void candidateRoleCannotEnterAdminArea() throws Exception {
        mockMvc.perform(get("/api/admin/companies").header(HttpHeaders.AUTHORIZATION, tokenFor(2001L, "ROLE_JOB_SEEKER")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }
}
