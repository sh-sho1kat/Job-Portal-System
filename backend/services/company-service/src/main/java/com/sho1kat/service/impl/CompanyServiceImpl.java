package com.sho1kat.service.impl;

import com.sho1kat.dto.companyServiceDto.request.CompanySearchCriteria;
import com.sho1kat.dto.companyServiceDto.request.CreateCompanyRequest;
import com.sho1kat.dto.companyServiceDto.request.SocialLinkRequest;
import com.sho1kat.dto.companyServiceDto.request.UpdateCompanyRequest;
import com.sho1kat.dto.companyServiceDto.response.CompanyResponse;
import com.sho1kat.dto.companyServiceDto.response.DetailedCompanyResponse;
import com.sho1kat.entity.Company;
import com.sho1kat.entity.CompanyLocation;
import com.sho1kat.enums.CompanyStatus;
import com.sho1kat.enums.SocialPlatform;
import com.sho1kat.exception.ApiException;
import com.sho1kat.mapper.CompanyMapper;
import com.sho1kat.repository.CompanyRepository;
import com.sho1kat.service.CompanyService;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyMapper companyMapper;

    // ---- public ----

    @Override
    @Transactional(readOnly = true)
    public Page<CompanyResponse> searchCompanies(CompanySearchCriteria criteria, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), Sort.by("name").ascending());
        return companyRepository.findAll(searchSpec(criteria), pageable).map(companyMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponse getCompanyById(Long id) {
        return companyMapper.toResponse(activeCompany(id));
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponse getCompanyBySlug(String slug) {
        Company company = companyRepository.findBySlug(slug)
                .filter(c -> c.getDeletedAt() == null && c.getCompanyStatus() == CompanyStatus.ACTIVE)
                .orElseThrow(() -> ApiException.notFound("Company not found with slug: " + slug));
        return companyMapper.toResponse(company);
    }


    // ---- employer / owner ----

    @Override
    @Transactional
    public DetailedCompanyResponse createCompany(Long ownerId, CreateCompanyRequest request) {

        verifyUserId(ownerId, "create a company");

        if (companyRepository.existsByOwnerId(ownerId)) {
            throw ApiException.conflict("This account already owns a company");
        }

        ensureNoDuplicatePlatforms(request.socialLinks());

        if (request.registrationNumber() != null && !request.registrationNumber().isBlank()
                && companyRepository.existsByRegistrationNumber(request.registrationNumber().trim())) {
            throw ApiException.conflict("Registration number is already in use");
        }

        Company company = companyMapper.toEntity(request, ownerId, convertToSlug(request.name(), null));

        return companyMapper.toDetailedResponse(companyRepository.save(company));
    }

    @Override
    @Transactional(readOnly = true)
    public DetailedCompanyResponse getMyCompany(Long ownerId) {
        verifyUserId(ownerId, "view your company");

        Company company = companyRepository.findByOwnerId(ownerId)
                .filter(c -> c.getDeletedAt() == null)
                .orElseThrow(() -> ApiException.notFound("No company profile exists for this account yet"));

        return companyMapper.toDetailedResponse(company);
    }

    @Override
    @Transactional
    public DetailedCompanyResponse updateCompany(Long companyId, Long requesterId, UpdateCompanyRequest request) {

        ensureNoDuplicatePlatforms(request.socialLinks());

        Company company = ownedCompany(companyId, requesterId);

        companyMapper.updateEntity(request, company);

        company.setSlug(convertToSlug(company.getName(), company.getSlug()));
        return companyMapper.toDetailedResponse(companyRepository.save(company));
    }

    @Override
    @Transactional
    public void deleteCompany(Long companyId, Long requesterId) {
        Company company = ownedCompany(companyId, requesterId);
        company.setDeletedAt(Instant.now()); // soft delete; public queries filter on deletedAt
        companyRepository.save(company);
    }

    // ---- helpers ----

    private Specification<Company> searchSpec(CompanySearchCriteria criteria) {

        List<Specification<Company>> parts = new ArrayList<>();
        parts.add((root, query, cb) -> cb.isNull(root.<String>get("deletedAt")));
        // the public catalogue only ever exposes verified, active companies
        parts.add((root, query, cb) -> cb.equal(root.get("companyStatus"), CompanyStatus.ACTIVE));

        if (criteria.name() != null && !criteria.name().isBlank()) {
            String pattern = "%" + criteria.name().trim().toLowerCase() + "%";
            parts.add((root, query, cb) -> cb.like(cb.lower(root.<String>get("name")), pattern));
        }
        if (criteria.industryType() != null) {
            parts.add((root, query, cb) -> cb.equal(root.get("industryType"), criteria.industryType()));
        }
        if (criteria.companySize() != null) {
            parts.add((root, query, cb) -> cb.equal(root.get("companySize"), criteria.companySize()));
        }
        if (criteria.companyType() != null) {
            parts.add((root, query, cb) -> cb.equal(root.get("companyType"), criteria.companyType()));
        }
        if (criteria.location() != null && !criteria.location().isBlank()) {         // matches across the joined locations, so mark the query distinct to keep
            String pattern = "%" + criteria.location().trim().toLowerCase() + "%";   // multi-location companies from being duplicated in the page
            parts.add((root, query, cb) -> {
                query.distinct(true);
                Join<Company, CompanyLocation> locations = root.join("locations", JoinType.LEFT);
                return cb.or(
                        cb.like(cb.lower(cb.coalesce(locations.<String>get("city"), "")), pattern),
                        cb.like(cb.lower(cb.coalesce(locations.<String>get("state"), "")), pattern),
                        cb.like(cb.lower(cb.coalesce(locations.<String>get("country"), "")), pattern)
                );
            });
        }
        return Specification.allOf(parts);
    }

    private Company activeCompany(Long id) {
        return companyRepository.findById(id)
                .filter(c -> c.getDeletedAt() == null && c.getCompanyStatus() == CompanyStatus.ACTIVE)
                .orElseThrow(() -> ApiException.notFound("Company not found with id: " + id));
    }

    private Company ownedCompany(Long companyId, Long requesterId) {
        verifyUserId(requesterId, "manage this company");
        Company company = companyRepository.findById(companyId)
                .filter(c -> c.getDeletedAt() == null)
                .orElseThrow(() -> ApiException.notFound("Company not found with id: " + companyId));
        if (!company.getOwnerId().equals(requesterId)) {
            throw ApiException.forbidden("Only the company owner can manage this company");
        }
        return company;
    }

    private void verifyUserId(Long id, String action) {
        if (id == null) {
            throw ApiException.unauthorized("Authentication is required to " + action);
        }
    }

    private void ensureNoDuplicatePlatforms(List<SocialLinkRequest> links) {
        if (links == null || links.isEmpty()) {
            return;
        }
        Set<SocialPlatform> seen = new HashSet<>();
        for (SocialLinkRequest link : links) {
            if (link == null || link.platform() == null) {
                throw ApiException.badRequest("Each social link must specify a platform");
            }
            if (!seen.add(link.platform())) {
                throw ApiException.badRequest("Duplicate social link platform: " + link.platform());
            }
        }
    }

    private String convertToSlug(String name, String currentSlug) {
        // Turn "Acme Labs" into "acme-labs", then extend with -2, -3, ... until the slug
        // is free. {@code currentSlug} is tolerated as a candidate so renames that keep
        // the same slug family do not loop.
        String base = slugify(name);
        String candidate = base;
        int suffix = 2;
        while (companyRepository.existsBySlug(candidate) && !candidate.equals(currentSlug)) {
            candidate = base + "-" + suffix++;
        }
        return candidate;
    }

    private String slugify(String value) {
        String slug = value.trim().toLowerCase()
                .replace("'", "")
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
        return slug.isBlank() ? "company" : slug;
    }
}
