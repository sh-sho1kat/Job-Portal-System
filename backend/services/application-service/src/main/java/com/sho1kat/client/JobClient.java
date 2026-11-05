package com.sho1kat.client;

import com.sho1kat.client.fallback.JobClientFallbackFactory;
import com.sho1kat.config.RequesterForwardFeignConfig;
import com.sho1kat.dto.jobServiceDto.response.JobSummaryResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "job-service",
        fallbackFactory = JobClientFallbackFactory.class,
        configuration = RequesterForwardFeignConfig.class)
public interface JobClient {
    @GetMapping("/api/jobs/{id}")
    JobSummaryResponse getJobById(@PathVariable("id") Long id);
}