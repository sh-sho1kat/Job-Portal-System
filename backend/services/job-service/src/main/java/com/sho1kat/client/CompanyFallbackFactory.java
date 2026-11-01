package com.sho1kat.client;

import com.sho1kat.dto.jobServiceDto.response.CompanySummaryResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

/**
 * Answers the id-only summary the DTO documents on any failed company lookup —
 * company-service down, unknown/deactivated company, registry unavailable.
 * The WARN line keeps degradation visible in job-service's logs.
 */
@Slf4j
@Component
public class CompanyFallbackFactory implements FallbackFactory<CompanyClient> {

    @Override
    public CompanyClient create(Throwable cause) {
        return companyId -> {
            log.warn("company lookup for company {} failed ({}): job cards degrade to id-only summaries",
                    companyId, cause.getMessage());
            return new CompanySummaryResponse(companyId, null, null, null, null);
        };
    }
}
