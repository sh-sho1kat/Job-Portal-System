package com.sho1kat.client.fallback;

import com.sho1kat.client.ResumeClient;
import com.sho1kat.dto.ResumeServiceDto.response.ResumeSummaryResponse;
import com.sho1kat.dto.userServiceDto.response.CandidateSummaryResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ResumeClientFallbackFactory implements FallbackFactory<ResumeClient> {
    @Override
    public ResumeClient create(Throwable cause) {
        log.warn("resume lookup failed ({}): detail views degrade without the resume", cause.getMessage());
        return new ResumeClient() {

            @Override
            public ResumeSummaryResponse getResume(Long resumeId, Long candidateId) {
                return null;
            }

            @Override
            public CandidateSummaryResponse getCandidateSummary(Long resumeId, Long candidateId) {
                return new CandidateSummaryResponse(candidateId, null, null, null, null, null, null);
            }
        };
    }
}