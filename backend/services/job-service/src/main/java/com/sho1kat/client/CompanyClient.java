package com.sho1kat.client;

import com.sho1kat.dto.companyServiceDto.response.CompanySummaryResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


@FeignClient(name = "company-service", fallbackFactory = CompanyFallbackFactory.class)
public interface CompanyClient {

    @GetMapping("/api/companies/{id}")
    CompanySummaryResponse getCompanyById(@PathVariable("id") Long id);

    @GetMapping("/api/companies/my-company")
    CompanySummaryResponse getMyCompany();
}
