package com.sho1kat.dto.companyServiceDto.request;

import com.sho1kat.enums.CompanySize;
import com.sho1kat.enums.CompanyType;
import com.sho1kat.enums.IndustryType;

public record CompanySearchCriteria(
        String name,
        IndustryType industryType,
        String location,
        CompanySize companySize,
        CompanyType companyType
) {
}
