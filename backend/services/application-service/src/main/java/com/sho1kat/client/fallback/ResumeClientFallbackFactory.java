package com.sho1kat.client.fallback;

import com.sho1kat.client.ResumeClient;
import com.sho1kat.dto.ResumeServiceDto.response.ResumeResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ResumeClientFallbackFactory implements FallbackFactory<ResumeClient> {
    @Override
    public ResumeClient create(Throwable cause) {
        return id -> new ResumeResponse(null, null, null, null, null, null, null, null, null, null, null, null);
    }
}