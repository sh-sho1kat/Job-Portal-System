package com.sho1kat.client;

import com.sho1kat.dto.jobServiceDto.response.CompanySummaryResponse;
import com.sho1kat.exception.ApiException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

// Fallback factory for the CompanyClient, providing a degraded response when the company-service is unavailable.
@Slf4j
@Component
public class CompanyFallbackFactory implements FallbackFactory<CompanyClient> {

    @Override
    public CompanyClient create(Throwable cause) {
        log.warn("company lookup failed ({}): job cards degrade to id-only summaries",
                cause.getMessage());
        return new CompanyClient() {
            @Override
            public CompanySummaryResponse getCompanyById(Long companyId) {
                return new CompanySummaryResponse(companyId, null, null, null, null);
            }

            @Override
            public CompanySummaryResponse getMyCompany() {
                // company-service is down: ownership cannot be verified, so creating
                // a posting must fail instead of silently trusting existing data
                throw ApiException.serviceUnavailable(
                        "Company ownership could not be verified: company-service is unavailable. Please try again.");
            }
        };
    }
}
