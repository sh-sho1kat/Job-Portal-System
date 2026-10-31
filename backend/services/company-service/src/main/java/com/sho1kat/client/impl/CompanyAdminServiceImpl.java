package com.sho1kat.client.impl;

import com.sho1kat.dto.companyServiceDto.response.DetailedCompanyResponse;
import com.sho1kat.entity.Company;
import com.sho1kat.enums.CompanyStatus;
import com.sho1kat.exception.ApiException;
import com.sho1kat.mapper.CompanyMapper;
import com.sho1kat.repository.CompanyRepository;
import com.sho1kat.client.CompanyAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyAdminServiceImpl implements CompanyAdminService {

    private final CompanyRepository companyRepository;
    private final CompanyMapper companyMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<DetailedCompanyResponse> listCompanies(CompanyStatus status, String name, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.clamp(size, 1, 100),
                Sort.by("createdAt").descending());

        List<Specification<Company>> parts = new ArrayList<>();
        parts.add((root, query, cb) -> cb.isNull(root.<String>get("deletedAt")));
        if (status != null) {
            parts.add((root, query, cb) -> cb.equal(root.get("companyStatus"), status));
        }
        if (name != null && !name.isBlank()) {
            String pattern = "%" + name.trim().toLowerCase() + "%";
            parts.add((root, query, cb) -> cb.like(cb.lower(root.<String>get("name")), pattern));
        }

        return companyRepository.findAll(Specification.allOf(parts), pageable)
                .map(companyMapper::toDetailedResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public DetailedCompanyResponse getCompany(Long companyId) {
        return companyMapper.toDetailedResponse(requireCompany(companyId));
    }

    /** PENDING_VERIFICATION -> ACTIVE */
    @Override
    @Transactional
    public DetailedCompanyResponse approve(Long companyId) {
        Company company = requireCompany(companyId);
        requireStatus(company, CompanyStatus.PENDING_VERIFICATION, "Only companies pending verification can be approved");
        company.setCompanyStatus(CompanyStatus.ACTIVE);
        company.setVerifiedAt(Instant.now());
        log.info("Company {} approved", companyId);
        return companyMapper.toDetailedResponse(companyRepository.save(company));
    }

    /** PENDING_VERIFICATION -> REJECTED */
    @Override
    @Transactional
    public DetailedCompanyResponse reject(Long companyId, String reason) {
        Company company = requireCompany(companyId);
        requireStatus(company, CompanyStatus.PENDING_VERIFICATION, "Only companies pending verification can be rejected");
        company.setCompanyStatus(CompanyStatus.REJECTED);
        log.info("Company {} rejected: {}", companyId, reason);
        return companyMapper.toDetailedResponse(companyRepository.save(company));
    }

    /** ACTIVE -> SUSPENDED */
    @Override
    @Transactional
    public DetailedCompanyResponse suspend(Long companyId, String reason) {
        Company company = requireCompany(companyId);
        requireStatus(company, CompanyStatus.ACTIVE, "Only active companies can be suspended");
        company.setCompanyStatus(CompanyStatus.SUSPENDED);
        company.setSuspendedAt(Instant.now());
        log.info("Company {} suspended: {}", companyId, reason);
        return companyMapper.toDetailedResponse(companyRepository.save(company));
    }

    /** SUSPENDED -> ACTIVE */
    @Override
    @Transactional
    public DetailedCompanyResponse reactivate(Long companyId) {
        Company company = requireCompany(companyId);
        requireStatus(company, CompanyStatus.SUSPENDED, "Only suspended companies can be reactivated");
        company.setCompanyStatus(CompanyStatus.ACTIVE);
        company.setSuspendedAt(null);
        log.info("Company {} reactivated", companyId);
        return companyMapper.toDetailedResponse(companyRepository.save(company));
    }

    // ---- helpers ----

    private Company requireCompany(Long companyId) {
        return companyRepository.findById(companyId)
                .orElseThrow(() -> ApiException.notFound("Company not found with id: " + companyId));
    }

    private void requireStatus(Company company, CompanyStatus expected, String message) {
        if (company.getCompanyStatus() != expected) {
            throw ApiException.badRequest(message + " (current status: " + company.getCompanyStatus() + ")");
        }
    }
}
