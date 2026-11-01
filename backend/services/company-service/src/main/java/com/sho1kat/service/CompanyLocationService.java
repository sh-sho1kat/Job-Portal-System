package com.sho1kat.service;

import com.sho1kat.dto.companyServiceDto.request.LocationRequest;
import com.sho1kat.dto.companyServiceDto.response.LocationResponse;

import java.util.List;

public interface CompanyLocationService {
    List<LocationResponse> getLocations(Long companyId);

    LocationResponse addLocation(Long companyId, Long requesterId, LocationRequest request);

    LocationResponse updateLocation(Long companyId, Long locationId, Long requesterId, LocationRequest request);

    void deleteLocation(Long companyId, Long locationId, Long requesterId);
}
