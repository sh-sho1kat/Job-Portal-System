package com.sho1kat.client;

import com.sho1kat.dto.companyServiceDto.response.DetailedCompanyResponse;
import com.sho1kat.enums.CompanyStatus;
import org.springframework.data.domain.Page;

public interface CompanyAdminService {
    Page<DetailedCompanyResponse> listCompanies(CompanyStatus status, String name, int page, int size);

    DetailedCompanyResponse getCompany(Long companyId);

    /** PENDING_VERIFICATION -> ACTIVE */
     DetailedCompanyResponse approve(Long companyId);

    /** PENDING_VERIFICATION -> REJECTED */
    DetailedCompanyResponse reject(Long companyId, String reason);

    /** ACTIVE -> SUSPENDED */
    DetailedCompanyResponse suspend(Long companyId, String reason);

    /** SUSPENDED -> ACTIVE */
    DetailedCompanyResponse reactivate(Long companyId);
}
