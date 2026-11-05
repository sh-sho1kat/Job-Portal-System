package com.sho1kat.client;


import com.sho1kat.client.fallback.UserClientFallbackFactory;
import com.sho1kat.config.InternalTokenFeignConfig;
import com.sho1kat.dto.userServiceDto.response.CandidateSummaryResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "user-service",
        fallbackFactory = UserClientFallbackFactory.class,
        configuration = InternalTokenFeignConfig.class)
public interface UserClient {

    @GetMapping("/internal/users/{id}/summary")
    CandidateSummaryResponse getUserSummary(@PathVariable("id") Long id);
}