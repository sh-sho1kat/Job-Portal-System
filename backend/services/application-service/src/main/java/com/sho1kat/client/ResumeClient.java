package com.sho1kat.client;

import com.sho1kat.client.fallback.ResumeClientFallbackFactory;
import com.sho1kat.config.InternalTokenFeignConfig;
import com.sho1kat.dto.ResumeServiceDto.response.ResumeSummaryResponse;
import com.sho1kat.dto.userServiceDto.response.CandidateSummaryResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "resume-service",
        fallbackFactory = ResumeClientFallbackFactory.class,
        configuration = InternalTokenFeignConfig.class)
public interface ResumeClient {

    @GetMapping("/internal/resumes/{resumeId}")
    ResumeSummaryResponse getResume(@PathVariable("resumeId") Long resumeId,
                             @RequestParam("candidateId") Long candidateId);

    @GetMapping("/internal/resumes/{resumeId}/candidate-summary")
    CandidateSummaryResponse getCandidateSummary(@PathVariable("resumeId") Long resumeId,
                                                 @RequestParam("candidateId") Long candidateId);
}