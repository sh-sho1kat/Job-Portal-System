package com.sho1kat.service.impl;

import com.sho1kat.dto.companyServiceDto.request.CompanySearchCriteria;
import com.sho1kat.dto.companyServiceDto.request.CreateCompanyRequest;
import com.sho1kat.dto.companyServiceDto.request.UpdateCompanyRequest;
import com.sho1kat.dto.companyServiceDto.response.CompanyResponse;
import com.sho1kat.dto.companyServiceDto.response.DetailedCompanyResponse;
import com.sho1kat.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {
    @Override
    public Page<CompanyResponse> searchCompanies(CompanySearchCriteria criteria, int page, int size) {
        return null;
    }

    @Override
    public CompanyResponse getCompanyById(Long id) {
        return null;
    }

    @Override
    public CompanyResponse getCompanyBySlug(String slug) {
        return null;
    }

    @Override
    public DetailedCompanyResponse createCompany(Long ownerId, CreateCompanyRequest request) {
        return null;
    }

    @Override
    public DetailedCompanyResponse getMyCompany(Long ownerId) {
        return null;
    }

    @Override
    public DetailedCompanyResponse updateCompany(Long companyId, Long requesterId, UpdateCompanyRequest request) {
        return null;
    }

    @Override
    public void deleteCompany(Long companyId, Long requesterId) {

    }
}
