package com.sho1kat.config;

import com.sho1kat.filter.UserHeaderFilter;
import org.springframework.cloud.gateway.server.mvc.filter.LoadBalancerFilterFunctions;
import org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions;
import org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.web.servlet.function.RequestPredicate;
import org.springframework.web.servlet.function.RequestPredicates;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

/**
 * ROUTING ONLY. Who may call what is decided in SecurityConfig.
 *
 * Every route has an explicit @Order. Lower number = checked first, so
 * specific routes must have a lower number than broad ones
 * (e.g. /api/companies/{id}/applications before /api/companies/**).
 */
@Configuration
public class RouteConfig {

    // ---------------------------------------------------------------- helpers

    /** Matches any of the given path patterns. */
    private static RequestPredicate paths(String first, String... others) {
        RequestPredicate predicate = RequestPredicates.path(first);
        for (String other : others) {
            predicate = predicate.or(RequestPredicates.path(other));
        }
        return predicate;
    }

    /** Builds a route that proxies to a load balanced service and adds X-User-* headers. */
    private static RouterFunction<ServerResponse> proxy(String routeId,
                                                        String serviceName,
                                                        RequestPredicate predicate) {
        return GatewayRouterFunctions.route(routeId)
                .route(predicate, HandlerFunctions.http())
                .before(UserHeaderFilter::addUserHeaders)
                .filter(LoadBalancerFilterFunctions.lb(serviceName))
                .build();
    }

    // ----------------------------------------------------- specific routes first

    /** /api/companies/{companyId}/applications  -> application-service */
    @Bean
    @Order(1)
    public RouterFunction<ServerResponse> applicationCompanyRoutes() {
        return proxy("application-company-routes", "application-service",
                paths("/api/companies/*/applications",
                        "/api/companies/*/applications/**"));
    }

    @Bean
    @Order(2)
    public RouterFunction<ServerResponse> adminCompanyRoutes() {
        return proxy("admin-company-routes", "company-service",
                paths("/api/admin/companies",
                        "/api/admin/companies/**"));
    }

    @Bean
    @Order(3)
    public RouterFunction<ServerResponse> adminJobRoutes() {
        return proxy("admin-job-routes", "job-service",
                paths("/api/admin/jobs",
                        "/api/admin/jobs/**"));
    }

    // ------------------------------------------------------------ general routes

    /** login, register, refresh, /me, /me/password ... all live in user-service. */
    @Bean
    @Order(10)
    public RouterFunction<ServerResponse> authRoutes() {
        return proxy("auth-routes", "user-service",
                paths("/api/auth/**"));
    }

    @Bean
    @Order(11)
    public RouterFunction<ServerResponse> userRoutes() {
        return proxy("user-routes", "user-service",
                paths("/api/users",
                        "/api/users/**"));
    }

    @Bean
    @Order(12)
    public RouterFunction<ServerResponse> jobRoutes() {
        return proxy("job-routes", "job-service",
                paths("/api/jobs",
                        "/api/jobs/**",
                        "/api/job-categories",
                        "/api/job-categories/**",
                        "/api/job-skills",
                        "/api/job-skills/**",
                        "/api/job-tags",
                        "/api/job-tags/**"));
    }

    @Bean
    @Order(13)
    public RouterFunction<ServerResponse> companyRoutes() {
        return proxy("company-routes", "company-service",
                paths("/api/companies",
                        "/api/companies/**"));
    }

    @Bean
    @Order(14)
    public RouterFunction<ServerResponse> applicationRoutes() {
        return proxy("application-routes", "application-service",
                paths("/api/applications",
                        "/api/applications/**"));
    }

    @Bean
    @Order(15)
    public RouterFunction<ServerResponse> jobPreferenceRoutes() {
        return proxy("job-preference-routes", "job-preference-service",
                paths("/api/preferences/saved-jobs",
                        "/api/preferences/saved-jobs/**"));
    }

    @Bean
    @Order(16)
    public RouterFunction<ServerResponse> resumeRoutes() {
        return proxy("resume-routes", "resume-service",
                paths("/api/resumes",
                        "/api/resumes/**"));
    }

    @Bean
    @Order(17)
    public RouterFunction<ServerResponse> aiRoutes() {
        return proxy("ai-routes", "ai-service",
                paths("/api/ai",
                        "/api/ai/**"));
    }
}