package com.sho1kat.dto.companyServiceDto.response;

import com.sho1kat.embeddable.SocialLink;
import com.sho1kat.enums.CompanySize;
import com.sho1kat.enums.CompanyStatus;
import com.sho1kat.enums.CompanyType;
import com.sho1kat.enums.IndustryType;

import java.util.List;

public record CompanyResponse(

        Long id,
        String name,
        String slug,
        String tagline,
        String logoUrl,
        String website,
        String email,
        String phone,
        Integer foundingYear,
        CompanySize companySize,
        CompanyType companyType,
        IndustryType industryType,
        CompanyStatus companyStatus,

        List<SocialLink>socialLinks,
        List<LocationResponse> locations

) {
}
