package com.sho1kat.config;

import org.springframework.cloud.gateway.server.mvc.filter.LoadBalancerFilterFunctions;
import org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions;
import org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RequestPredicates;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

@Configuration
public class RouteConfig {

    @Bean
    public RouterFunction<ServerResponse> authRouts(){
        return GatewayRouterFunctions.route("auth-routes")
                .route(RequestPredicates.path("/api/auth/**"), HandlerFunctions.http())
                .filter(LoadBalancerFilterFunctions.lb("user-service"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> adminRouts(){
        return GatewayRouterFunctions.route("admin-routes")
                .route(RequestPredicates.path("/api/admin/**"), HandlerFunctions.http())
                .filter(LoadBalancerFilterFunctions.lb("admin-service"))
//                .before(jwtAuthenticationFilter())
//                .before(request -> requireRole(request, "ROLE_ADMIN"))
                .build();
    }


    @Bean
    public RouterFunction<ServerResponse> UserServiceRouts(){
        return GatewayRouterFunctions.route("user-routes")
                .route(RequestPredicates.path("/api/user/**"), HandlerFunctions.http())
                .filter(LoadBalancerFilterFunctions.lb("user-service"))
//                .before(jwtAuthenticationFilter())
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> CompanyServiceRouts(){
        return GatewayRouterFunctions.route("company-routes")
                .route(RequestPredicates.path("/api/company/**"), HandlerFunctions.http())
                .filter(LoadBalancerFilterFunctions.lb("company-service"))
//                .before(jwtAuthenticationFilter())
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> JobServiceRouts(){
        return GatewayRouterFunctions.route("job-routes")
                .route(RequestPredicates.path("/api/job/**"), HandlerFunctions.http())
                .filter(LoadBalancerFilterFunctions.lb("job-service"))
//                .before(jwtAuthenticationFilter())
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> ApplicationServiceRouts(){
        return GatewayRouterFunctions.route("application-routes")
                .route(RequestPredicates.path("/api/application/**"), HandlerFunctions.http())
                .filter(LoadBalancerFilterFunctions.lb("application-service"))
//                .before(jwtAuthenticationFilter())
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> SavedJobServiceRouts(){
        return GatewayRouterFunctions.route("saved-job-routes")
                .route(RequestPredicates.path("/api/saved-job/**"), HandlerFunctions.http())
                .filter(LoadBalancerFilterFunctions.lb("saved-job-service"))
//                .before(jwtAuthenticationFilter())
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> JobPreferenceServiceRouts(){
        return GatewayRouterFunctions.route("job-preference-routes")
                .route(RequestPredicates.path("/api/job-preference/**"), HandlerFunctions.http())
                .filter(LoadBalancerFilterFunctions.lb("job-preference-service"))
//                .before(jwtAuthenticationFilter())
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> ResumeServiceRouts(){
        return GatewayRouterFunctions.route("resume-routes")
                .route(RequestPredicates.path("/api/resumes/**")
                        .or(RequestPredicates.path("/api/jobskills/**")), HandlerFunctions.http())
                .filter(LoadBalancerFilterFunctions.lb("resume-service"))
//                .before(jwtAuthenticationFilter())
                .build();
    }




}
