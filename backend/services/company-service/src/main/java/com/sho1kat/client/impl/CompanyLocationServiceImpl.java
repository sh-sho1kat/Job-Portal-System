package com.sho1kat.client.impl;

import com.sho1kat.dto.companyServiceDto.request.LocationRequest;
import com.sho1kat.dto.companyServiceDto.response.LocationResponse;
import com.sho1kat.entity.Company;
import com.sho1kat.entity.CompanyLocation;
import com.sho1kat.exception.ApiException;
import com.sho1kat.mapper.CompanyMapper;
import com.sho1kat.repository.CompanyLocationRepository;
import com.sho1kat.repository.CompanyRepository;
import com.sho1kat.client.CompanyLocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyLocationServiceImpl implements CompanyLocationService {

    private final CompanyRepository companyRepository;
    private final CompanyLocationRepository locationRepository;
    private final CompanyMapper companyMapper;

    @Override
    @Transactional(readOnly = true)
    public List<LocationResponse> getLocations(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .filter(c -> c.getDeletedAt() == null)
                .orElseThrow(() -> ApiException.notFound("Company not found with id: " + companyId));
        return locationRepository.findAllByCompanyIdOrderByIdAsc(company.getId()).stream()
                .map(companyMapper::toLocationResponse)
                .toList();
    }

    @Override
    @Transactional
    public LocationResponse addLocation(Long companyId, Long requesterId, LocationRequest request) {
        Company company = ownedCompany(companyId, requesterId);
        if (Boolean.TRUE.equals(request.headquarters())) {
            demoteHeadquarters(company, null);
        }
        CompanyLocation location = companyMapper.toLocationEntity(request, company);
        company.getLocations().add(location); // keep both sides of the association in sync
        return companyMapper.toLocationResponse(locationRepository.save(location));
    }

    @Override
    @Transactional
    public LocationResponse updateLocation(Long companyId, Long locationId, Long requesterId, LocationRequest request) {
        Company company = ownedCompany(companyId, requesterId);
        CompanyLocation location = findLocation(locationId, company.getId());
        if (Boolean.TRUE.equals(request.headquarters()) && !Boolean.TRUE.equals(location.getHeadquarters())) {
            demoteHeadquarters(company, location.getId());
        }
        companyMapper.updateLocationEntity(request, location);
        return companyMapper.toLocationResponse(locationRepository.save(location));
    }

    @Override
    @Transactional
    public void deleteLocation(Long companyId, Long locationId, Long requesterId) {
        Company company = ownedCompany(companyId, requesterId);
        CompanyLocation location = findLocation(locationId, company.getId());
        company.getLocations().remove(location); // orphanRemoval drops the row on flush
        locationRepository.delete(location);
    }

    // ---- helpers ----

    private Company ownedCompany(Long companyId, Long requesterId) {
        if (requesterId == null) {
            throw ApiException.unauthorized("Authentication is required to manage company locations");
        }
        Company company = companyRepository.findById(companyId)
                .filter(c -> c.getDeletedAt() == null)
                .orElseThrow(() -> ApiException.notFound("Company not found with id: " + companyId));
        if (!company.getOwnerId().equals(requesterId)) {
            throw ApiException.forbidden("Only the company owner can manage locations");
        }
        return company;
    }

    private CompanyLocation findLocation(Long locationId, Long companyId) {
        return locationRepository.findById(locationId)
                .filter(location -> companyId.equals(location.getCompany().getId()))
                .orElseThrow(() -> ApiException.notFound("Location not found with id: " + locationId));
    }

    /** Unset headquarters everywhere else; keepId stays headquarters (null when adding a new one). */
    private void demoteHeadquarters(Company company, Long keepId) {
        locationRepository.findAllByCompanyIdOrderByIdAsc(company.getId()).stream()
                .filter(location -> Boolean.TRUE.equals(location.getHeadquarters()))
                .filter(location -> !location.getId().equals(keepId))
                .forEach(location -> {
                    location.setHeadquarters(false);
                    locationRepository.save(location);
                });
    }
}
