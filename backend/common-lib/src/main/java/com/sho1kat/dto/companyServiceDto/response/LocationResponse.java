package com.sho1kat.dto.companyServiceDto.response;

public record LocationResponse(
        Long id,
        String label,
        String addressLine,
        String city,
        String state,
        String country,
        String postalCode,
        boolean headquarters
) {
}
