package com.sho1kat.client.fallback;

import com.sho1kat.client.CompanyClient;
import com.sho1kat.dto.jobServiceDto.response.CompanySummaryResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class CompanyClientFallbackFactory implements FallbackFactory<CompanyClient> {

    @Override
    public CompanyClient create(Throwable cause) {

        log.warn("Company service unavailable: {}", cause.toString());

        return id -> new CompanySummaryResponse(
                id,
                null,
                null,
                null,
                null
        );
    }
}