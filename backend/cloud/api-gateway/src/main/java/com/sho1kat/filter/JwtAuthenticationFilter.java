package com.sho1kat.filter;

import com.sho1kat.security.AuthenticatedUser;
import com.sho1kat.security.JwtService;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Parses the {@code Authorization: Bearer <token>} header and populates the
 * security context with the verified identity.
 *
 * A missing, invalid or expired token leaves the request unauthenticated:
 * public routes still pass, everything else is answered 401 by the entry point
 * in SecurityConfig. The filter never rejects on its own — authorization is the
 * security config's job.
 *
 * The only authority granted is the token's "role" claim, used as-is (it already
 * carries the ROLE_ prefix, e.g. ROLE_ADMIN), so SecurityConfig's hasRole("ADMIN")
 * matches. Downstream services additionally receive the whole Authorization
 * header, letting them re-verify the token for the fine-grained checks.
 */
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (header != null && header.startsWith(BEARER_PREFIX)
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                AuthenticatedUser principal = jwtService.parseToken(header.substring(BEARER_PREFIX.length()));

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        principal, null, List.of(new SimpleGrantedAuthority(principal.role())));
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (JwtException | IllegalArgumentException ex) {
                // invalid or expired token: leave the request unauthenticated, the entry point returns 401
                log.debug("Rejected JWT: {}", ex.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
