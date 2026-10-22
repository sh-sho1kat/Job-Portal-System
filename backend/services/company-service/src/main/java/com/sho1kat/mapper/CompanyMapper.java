package com.sho1kat.mapper;

import com.sho1kat.dto.companyServiceDto.request.CreateCompanyRequest;
import com.sho1kat.dto.companyServiceDto.request.LocationRequest;
import com.sho1kat.dto.companyServiceDto.request.SocialLinkRequest;
import com.sho1kat.dto.companyServiceDto.request.UpdateCompanyRequest;
import com.sho1kat.dto.companyServiceDto.response.CompanyResponse;
import com.sho1kat.dto.companyServiceDto.response.DetailedCompanyResponse;
import com.sho1kat.dto.companyServiceDto.response.LocationResponse;
import com.sho1kat.embeddable.SocialLink;
import com.sho1kat.entity.Company;
import com.sho1kat.entity.CompanyLocation;
import com.sho1kat.enums.CompanyStatus;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class CompanyMapper {

    /**
     * New companies always start pending verification; the slug is generated in the
     * service layer (it must check uniqueness against the repository first).
     */
    public Company toEntity(CreateCompanyRequest request, Long ownerId, String slug) {
        return Company.builder()
                .name(request.name().trim())
                .slug(slug)
                .tagline(trimToNull(request.tagline()))
                .description(trimToNull(request.description()))
                .logoUrl(trimToNull(request.logoUrl()))
                .coverImageUrl(trimToNull(request.coverImageUrl()))
                .website(trimToNull(request.website()))
                .email(trimToNull(request.email()))
                .phone(trimToNull(request.phone()))
                .foundingYear(request.foundingYear())
                .companySize(request.companySize())
                .companyType(request.companyType())
                .industryType(request.industryType())
                .registrationNumber(trimToNull(request.registrationNumber()))
                .ownerId(ownerId)
                .companyStatus(CompanyStatus.PENDING_VERIFICATION)
                .socialLinks(new ArrayList<>(socialLinks(request.socialLinks())))
                .build();
    }

    public CompanyResponse toResponse(Company company) {
        return new CompanyResponse(
                company.getId(),
                company.getName(),
                company.getSlug(),
                company.getTagline(),
                company.getLogoUrl(),
                company.getWebsite(),
                company.getEmail(),
                company.getPhone(),
                company.getFoundingYear(),
                company.getCompanySize(),
                company.getCompanyType(),
                company.getIndustryType(),
                company.getCompanyStatus()
        );
    }

    public DetailedCompanyResponse toDetailedResponse(Company company) {
        return new DetailedCompanyResponse(
                company.getId(),
                company.getName(),
                company.getSlug(),
                company.getTagline(),
                company.getDescription(),
                company.getLogoUrl(),
                company.getCoverImageUrl(),
                company.getWebsite(),
                company.getEmail(),
                company.getPhone(),
                company.getFoundingYear(),
                company.getCompanySize(),
                company.getCompanyType(),
                company.getIndustryType(),
                company.getCompanyStatus(),
                company.getSocialLinks(),
                company.getLocations().stream().map(this::toLocationResponse).toList(),
                company.getVerifiedAt(),
                company.getCreatedAt(),
                company.getUpdatedAt()
        );
    }

    public void updateEntity(UpdateCompanyRequest request, Company company) {
        company.setName(request.name().trim());
        company.setTagline(trimToNull(request.tagline()));
        company.setDescription(trimToNull(request.description()));
        company.setLogoUrl(trimToNull(request.logoUrl()));
        company.setCoverImageUrl(trimToNull(request.coverImageUrl()));
        company.setWebsite(trimToNull(request.website()));
        company.setEmail(trimToNull(request.email()));
        company.setPhone(trimToNull(request.phone()));
        company.setFoundingYear(request.foundingYear());
        company.setCompanySize(request.companySize());
        company.setCompanyType(request.companyType());
        company.setIndustryType(request.industryType());
        replaceSocialLinks(company, request.socialLinks());
    }

    public CompanyLocation toLocationEntity(LocationRequest request, Company company) {
        return CompanyLocation.builder()
                .company(company)
                .label(trimToNull(request.label()))
                .addressLine(trimToNull(request.addressLine()))
                .city(request.city().trim())
                .state(trimToNull(request.state()))
                .country(request.country().trim())
                .postalCode(trimToNull(request.postalCode()))
                .headquarters(Boolean.TRUE.equals(request.headquarters()))
                .build();
    }

    public void updateLocationEntity(LocationRequest request, CompanyLocation location) {
        location.setLabel(trimToNull(request.label()));
        location.setAddressLine(trimToNull(request.addressLine()));
        location.setCity(request.city().trim());
        location.setState(trimToNull(request.state()));
        location.setCountry(request.country().trim());
        location.setPostalCode(trimToNull(request.postalCode()));
        location.setHeadquarters(Boolean.TRUE.equals(request.headquarters()));
    }

    public LocationResponse toLocationResponse(CompanyLocation location) {
        return new LocationResponse(
                location.getId(),
                location.getLabel(),
                location.getAddressLine(),
                location.getCity(),
                location.getState(),
                location.getCountry(),
                location.getPostalCode(),
                Boolean.TRUE.equals(location.getHeadquarters())
        );
    }

    private void replaceSocialLinks(Company company, List<SocialLinkRequest> requests) {
        company.getSocialLinks().clear();
        if (requests != null) {
            requests.stream()
                    .filter(link -> link != null && link.platform() != null)
                    .forEach(link -> company.getSocialLinks().add(new SocialLink(link.platform(), link.url())));
        }
    }

    private List<SocialLink> socialLinks(List<SocialLinkRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return List.of();
        }
        return requests.stream()
                .filter(link -> link != null && link.platform() != null)
                .map(link -> new SocialLink(link.platform(), link.url()))
                .toList();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
