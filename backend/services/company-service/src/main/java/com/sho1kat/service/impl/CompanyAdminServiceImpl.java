package com.sho1kat.service.impl;

import com.sho1kat.dto.companyServiceDto.response.DetailedCompanyResponse;
import com.sho1kat.enums.CompanyStatus;
import com.sho1kat.service.CompanyAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CompanyAdminServiceImpl implements CompanyAdminService {
    @Override
    public Page<DetailedCompanyResponse> listCompanies(CompanyStatus status, String name, int page, int size) {
        return null;
    }

    @Override
    public DetailedCompanyResponse getCompany(Long companyId) {
        return null;
    }

    @Override
    public DetailedCompanyResponse approve(Long companyId) {
        return null;
    }

    @Override
    public DetailedCompanyResponse reject(Long companyId, String reason) {
        return null;
    }

    @Override
    public DetailedCompanyResponse suspend(Long companyId, String reason) {
        return null;
    }

    @Override
    public DetailedCompanyResponse reactivate(Long companyId) {
        return null;
    }
}
