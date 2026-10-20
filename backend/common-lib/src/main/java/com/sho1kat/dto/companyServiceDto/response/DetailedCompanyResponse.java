package com.sho1kat.dto.companyServiceDto.response;

import com.sho1kat.embeddable.SocialLink;
import com.sho1kat.enums.CompanySize;
import com.sho1kat.enums.CompanyStatus;
import com.sho1kat.enums.CompanyType;
import com.sho1kat.enums.IndustryType;

import java.time.Instant;
import java.util.List;

public record DetailedCompanyResponse(

        Long id,
        String name,
        String slug,
        String tagline,
        String description,
        String logoUrl,
        String coverImageUrl,
        String website,
        Integer foundingYear,
        CompanySize companySize,
        CompanyType companyType,
        IndustryType industryType,
        CompanyStatus companyStatus,
        List<SocialLink> socialLinks,
        List<LocationResponse> locations,
        Instant verifiedAt,
        Instant createdAt,
        Instant updatedAt

) {
}
