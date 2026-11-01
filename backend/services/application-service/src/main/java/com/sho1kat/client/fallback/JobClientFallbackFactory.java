package com.sho1kat.client.fallback;

import com.sho1kat.client.JobClient;
import com.sho1kat.dto.jobServiceDto.response.JobSummaryResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class JobClientFallbackFactory
        implements FallbackFactory<JobClient> {

    @Override
    public JobClient create(Throwable cause) {

        log.warn("Job service unavailable: {}", cause.toString());

        return id -> new JobSummaryResponse(
                id,
                null,
                null,
                null,
                null
        );
    }
}