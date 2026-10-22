package com.sho1kat.dto.companyServiceDto.response;

import com.sho1kat.enums.CompanySize;
import com.sho1kat.enums.CompanyStatus;
import com.sho1kat.enums.CompanyType;
import com.sho1kat.enums.IndustryType;

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
        CompanyStatus companyStatus

) {
}
