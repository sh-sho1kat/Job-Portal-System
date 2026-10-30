package com.sho1kat.config;

import com.sho1kat.filter.JwtAuthenticationFilter;
import com.sho1kat.security.JwtService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

/**
 * WHO MAY CALL WHAT — the front-door access decisions.
 *
 * Rules are checked top to bottom and the FIRST match wins, so keep specific
 * rules (per path / per method) above broader ones. Public rules outrank the
 * role rules for the same path, meaning a GET on a public read path stays open
 * while its writes are caught by the role rule further down.
 *
 * The access token's "role" claim already carries the ROLE_ prefix as
 * user-service writes it (e.g. ROLE_ADMIN), so it is added as the authority
 * as-is and hasRole("ADMIN") matches it.
 *
 * Division of labour between the tiers:
 * <ul>
 *   <li><b>Gateway (this file)</b> — coarse gate: is the request public, employer-only,
 *       admin-only or any-logged-in-user; forwards the verified identity as
 *       X-User-Id / X-User-Email / X-User-Role (see UserHeaderFilter).</li>
 *   <li><b>Services</b> — fine-grained business rules: the record addressed in the path
 *       must belong to that identity, method-level @PreAuthorize, status transitions.</li>
 * </ul>
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Names WITHOUT the ROLE_ prefix (hasRole adds it back)
    private static final String SUPER_ADMIN = "SUPER_ADMIN";
    private static final String ADMIN = "ADMIN";
    private static final String EMPLOYER = "EMPLOYER";
    private static final String JOB_SEEKER = "JOB_SEEKER";

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtService jwtService,
            @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
            String[] allowedOrigins) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource(allowedOrigins)))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // ---------- PUBLIC: auth entry points, rate-limited by user-service ----------

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/refresh",
                                "/api/auth/logout"
                        ).permitAll()

                        // ---------- ADMINS ONLY ----------

                        .requestMatchers(
                                "/api/admin/**"
                        ).hasAnyRole(ADMIN, SUPER_ADMIN)

                        // ---------- EMPLOYERS (admins too) ----------
                        // The employer's application inbox; must sit ABOVE the public
                        // GET /api/companies/** rule below.

                        .requestMatchers(
                                "/api/companies/*/applications",
                                "/api/companies/*/applications/**"
                        ).hasAnyRole(EMPLOYER, ADMIN, SUPER_ADMIN)

                        // ---------- AUTHENTICATED TAXONOMY READS ----------
                        // "all incl. inactive" views need a token, while plain catalog
                        // reads stay public — so this must sit above the public GET rule.

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/job-categories/all",
                                "/api/job-skills/all",
                                "/api/job-tags/all"
                        ).authenticated()

                        // ---------- PUBLIC READS ----------
                        // Catalog browsing requires no token: job search, company
                        // directories, taxonomy lookups.

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/jobs",
                                "/api/jobs/**",
                                "/api/job-categories",
                                "/api/job-categories/**",
                                "/api/job-skills",
                                "/api/job-skills/**",
                                "/api/job-tags",
                                "/api/job-tags/**"
                        ).permitAll()
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/companies",
                                "/api/companies/**"
                        ).permitAll()

                        // ---------- TAXONOMY WRITES: admins only ----------
                        // Everything left on these paths is a write (POST/PUT/DELETE)

                        .requestMatchers(
                                "/api/job-categories",
                                "/api/job-categories/**",
                                "/api/job-skills",
                                "/api/job-skills/**",
                                "/api/job-tags",
                                "/api/job-tags/**"
                        ).hasAnyRole(ADMIN, SUPER_ADMIN)

                        // ---------- OTHER WRITES: employers (admins too) ----------
                        // Create/update/delete jobs and companies. GETs were already
                        // matched above, so only writes fall through to here.

                        .requestMatchers(
                                "/api/jobs",
                                "/api/jobs/**"
                        ).hasAnyRole(EMPLOYER, ADMIN, SUPER_ADMIN)
                        .requestMatchers(
                                "/api/companies",
                                "/api/companies/**"
                        ).hasAnyRole(EMPLOYER, ADMIN, SUPER_ADMIN)

                        // ---------- JOB SEEKERS (admins too) ----------

                        .requestMatchers(
                                "/api/resumes",
                                "/api/resumes/**"
                        ).hasAnyRole(JOB_SEEKER, ADMIN, SUPER_ADMIN)

                        .requestMatchers(
                                "/api/preferences/**"
                        ).hasAnyRole(JOB_SEEKER, ADMIN, SUPER_ADMIN)

                        // ---------- ANY LOGGED-IN USER ----------
                        // Self-serve and owner-scoped endpoints; the service then checks
                        // the record addressed in the path belongs to X-User-Id (or lets
                        // an admin through via @PreAuthorize).

                        .requestMatchers(
                                "/api/auth/me",
                                "/api/auth/me/**"
                        ).authenticated()

                        .requestMatchers(
                                "/api/users",
                                "/api/users/**"
                        ).authenticated()

                        .requestMatchers(
                                "/api/applications",
                                "/api/applications/**"
                        ).authenticated()

                        // Anything not listed above needs a valid token

                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, e) ->
                                writeError(response, HttpServletResponse.SC_UNAUTHORIZED,
                                        "Authentication required: missing, invalid or expired bearer token"))
                        .accessDeniedHandler((request, response, e) ->
                                writeError(response, HttpServletResponse.SC_FORBIDDEN,
                                        "Forbidden: your role cannot call this endpoint")))
                .addFilterBefore(new JwtAuthenticationFilter(jwtService),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ------------------------------------------------------------------ helpers

    /** Browser apps call the gateway directly, so preflights must succeed. */
    private static CorsConfigurationSource corsConfigurationSource(String[] allowedOrigins) {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /** Uniform JSON error shape, matching the ApiResponse record in common-lib. */
    private static void writeError(HttpServletResponse response, int status, String message) {
        try {
            response.setStatus(status);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.getWriter()
                    .write("{\"success\": false, \"message\": \"" + message + "\"}");
        } catch (java.io.IOException ignored) {
            // response already committed — nothing more we can do
        }
    }
}
