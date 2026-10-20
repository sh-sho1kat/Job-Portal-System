package com.sho1kat.service;

import com.sho1kat.dto.companyServiceDto.request.CompanySearchCriteria;
import com.sho1kat.dto.companyServiceDto.request.CreateCompanyRequest;
import com.sho1kat.dto.companyServiceDto.request.UpdateCompanyRequest;
import com.sho1kat.dto.companyServiceDto.response.CompanyResponse;
import com.sho1kat.dto.companyServiceDto.response.DetailedCompanyResponse;
import org.springframework.data.domain.Page;

public interface CompanyService {
    // ---- public ----
    Page<CompanyResponse> searchCompanies(CompanySearchCriteria criteria, int page, int size);

    CompanyResponse getCompanyById(Long id);

    CompanyResponse getCompanyBySlug(String slug);


    // ---- employer / owner ----
    DetailedCompanyResponse createCompany(Long ownerId, CreateCompanyRequest request);

    DetailedCompanyResponse getMyCompany(Long ownerId);

    DetailedCompanyResponse updateCompany(Long companyId, Long requesterId, UpdateCompanyRequest request);

    void deleteCompany(Long companyId, Long requesterId);
}
