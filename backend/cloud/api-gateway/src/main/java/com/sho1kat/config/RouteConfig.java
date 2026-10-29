package com.sho1kat.config;

import org.springframework.cloud.gateway.server.mvc.filter.LoadBalancerFilterFunctions;
import org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions;
import org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.web.servlet.function.RequestPredicates;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

@Configuration
public class RouteConfig {

    // ==========================================
    // Application service — employer inbox
    // Register before the general company routes.
    // ==========================================

    @Bean
    @Order(1)
    public RouterFunction<ServerResponse> applicationCompanyRoutes() {
        return GatewayRouterFunctions.route("application-company-routes")
                .route(
                        RequestPredicates.path(
                                "/api/companies/*/applications"
                        ).or(RequestPredicates.path(
                                "/api/companies/*/applications/**"
                        )),
                        HandlerFunctions.http()
                )
                .filter(LoadBalancerFilterFunctions.lb("application-service"))
                .build();
    }

    // ==========================================
    // Public authentication endpoints
    // ==========================================

    @Bean
    @Order(2)
    public RouterFunction<ServerResponse> authRoutes() {
        return GatewayRouterFunctions.route("auth-routes")
                .route(
                        RequestPredicates.path("/api/auth")
                                .or(RequestPredicates.path("/api/auth/**")),
                        HandlerFunctions.http()
                )
                .filter(LoadBalancerFilterFunctions.lb("user-service"))
                .build();
    }

    // ==========================================
    // User management
    // ==========================================

    @Bean
    @Order(3)
    public RouterFunction<ServerResponse> userRoutes() {
        return GatewayRouterFunctions.route("user-routes")
                .route(
                        RequestPredicates.path("/api/users")
                                .or(RequestPredicates.path("/api/users/**")),
                        HandlerFunctions.http()
                )
                .filter(LoadBalancerFilterFunctions.lb("user-service"))
                .build();
    }

    // ==========================================
    // Company APIs
    // ==========================================

    @Bean
    @Order(4)
    public RouterFunction<ServerResponse> companyRoutes() {
        return GatewayRouterFunctions.route("company-routes")
                .route(
                        RequestPredicates.path("/api/companies")
                                .or(RequestPredicates.path("/api/companies/**")),
                        HandlerFunctions.http()
                )
                .filter(LoadBalancerFilterFunctions.lb("company-service"))
                .build();
    }

    // ==========================================
    // Company administration
    // ==========================================

    @Bean
    @Order(5)
    public RouterFunction<ServerResponse> adminCompanyRoutes() {
        return GatewayRouterFunctions.route("admin-company-routes")
                .route(
                        RequestPredicates.path("/api/admin/companies")
                                .or(RequestPredicates.path(
                                        "/api/admin/companies/**"
                                )),
                        HandlerFunctions.http()
                )
                .filter(LoadBalancerFilterFunctions.lb("company-service"))
                .build();
    }

    // ==========================================
    // Job administration
    // ==========================================

    @Bean
    @Order(6)
    public RouterFunction<ServerResponse> adminJobRoutes() {
        return GatewayRouterFunctions.route("admin-job-routes")
                .route(
                        RequestPredicates.path("/api/admin/jobs")
                                .or(RequestPredicates.path(
                                        "/api/admin/jobs/**"
                                )),
                        HandlerFunctions.http()
                )
                .filter(LoadBalancerFilterFunctions.lb("job-service"))
                .build();
    }

    // ==========================================
    // Jobs, categories, skills and tags
    // ==========================================

    @Bean
    @Order(7)
    public RouterFunction<ServerResponse> jobRoutes() {
        return GatewayRouterFunctions.route("job-routes")
                .route(
                        RequestPredicates.path("/api/jobs")
                                .or(RequestPredicates.path("/api/jobs/**"))
                                .or(RequestPredicates.path(
                                        "/api/job-categories"
                                ))
                                .or(RequestPredicates.path(
                                        "/api/job-categories/**"
                                ))
                                .or(RequestPredicates.path("/api/job-skills"))
                                .or(RequestPredicates.path(
                                        "/api/job-skills/**"
                                ))
                                .or(RequestPredicates.path("/api/job-tags"))
                                .or(RequestPredicates.path("/api/job-tags/**")),
                        HandlerFunctions.http()
                )
                .filter(LoadBalancerFilterFunctions.lb("job-service"))
                .build();
    }

    // ==========================================
    // Applications
    // ==========================================

    @Bean
    @Order(8)
    public RouterFunction<ServerResponse> applicationRoutes() {
        return GatewayRouterFunctions.route("application-routes")
                .route(
                        RequestPredicates.path("/api/applications")
                                .or(RequestPredicates.path(
                                        "/api/applications/**"
                                )),
                        HandlerFunctions.http()
                )
                .filter(LoadBalancerFilterFunctions.lb("application-service"))
                .build();
    }

    // ==========================================
    // Saved jobs / bookmarks
    // ==========================================

    @Bean
    @Order(9)
    public RouterFunction<ServerResponse> jobPreferenceRoutes() {
        return GatewayRouterFunctions.route("job-preference-routes")
                .route(
                        RequestPredicates.path(
                                "/api/preferences/saved-jobs"
                        ).or(RequestPredicates.path(
                                "/api/preferences/saved-jobs/**"
                        )),
                        HandlerFunctions.http()
                )
                .filter(
                        LoadBalancerFilterFunctions.lb(
                                "job-preference-service"
                        )
                )
                .build();
    }

    // ==========================================
    // Resume builder and resume sections
    // ==========================================

    @Bean
    @Order(10)
    public RouterFunction<ServerResponse> resumeRoutes() {
        return GatewayRouterFunctions.route("resume-routes")
                .route(
                        RequestPredicates.path("/api/resumes")
                                .or(RequestPredicates.path("/api/resumes/**")),
                        HandlerFunctions.http()
                )
                .filter(LoadBalancerFilterFunctions.lb("resume-service"))
                .build();
    }
}