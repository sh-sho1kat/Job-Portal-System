package com.sho1kat.client;

import com.sho1kat.client.fallback.ResumeClientFallbackFactory;
import com.sho1kat.config.InternalTokenFeignConfig;
import com.sho1kat.dto.ResumeServiceDto.response.ResumeResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "resume-service",
        fallbackFactory = ResumeClientFallbackFactory.class,
        configuration = InternalTokenFeignConfig.class)
public interface ResumeClient {

    @GetMapping("/internal/resumes/{resumeId}")
    ResumeResponse getResume(@PathVariable("resumeId") Long resumeId,
                             @RequestParam("candidateId") Long candidateId);
}