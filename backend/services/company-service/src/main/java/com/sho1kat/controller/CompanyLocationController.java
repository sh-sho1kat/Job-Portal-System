package com.sho1kat.controller;

import com.sho1kat.dto.companyServiceDto.request.LocationRequest;
import com.sho1kat.dto.companyServiceDto.response.LocationResponse;
import com.sho1kat.security.RequesterContext;
import com.sho1kat.service.CompanyLocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies/{companyId}/locations")
@RequiredArgsConstructor
public class CompanyLocationController {

    private final CompanyLocationService locationService;

    @GetMapping
    public ResponseEntity<List<LocationResponse>> getLocations(@PathVariable Long companyId) {
        return ResponseEntity.ok(locationService.getLocations(companyId));
    }

    @PostMapping
    public ResponseEntity<LocationResponse> addLocation(
            @PathVariable Long companyId,
            @RequestHeader(name = RequesterContext.USER_ID_HEADER, required = false) String userId,
            @RequestHeader(name = RequesterContext.USER_ROLE_HEADER, required = false) String role,
            @Valid @RequestBody LocationRequest request) {
        RequesterContext requester = RequesterContext.fromHeaders(userId, role);
        requester.checkIfJobSeeker();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(locationService.addLocation(companyId, requester.userId(), request));
    }

    @PutMapping("/{locationId}")
    public ResponseEntity<LocationResponse> updateLocation(
            @PathVariable Long companyId,
            @PathVariable Long locationId,
            @RequestHeader(name = RequesterContext.USER_ID_HEADER, required = false) String userId,
            @RequestHeader(name = RequesterContext.USER_ROLE_HEADER, required = false) String role,
            @Valid @RequestBody LocationRequest request) {
        RequesterContext requester = RequesterContext.fromHeaders(userId, role);
        requester.checkIfJobSeeker();
        return ResponseEntity.ok(
                locationService.updateLocation(companyId, locationId, requester.userId(), request));
    }

    @DeleteMapping("/{locationId}")
    public ResponseEntity<Void> deleteLocation(
            @PathVariable Long companyId,
            @PathVariable Long locationId,
            @RequestHeader(name = RequesterContext.USER_ID_HEADER, required = false) String userId,
            @RequestHeader(name = RequesterContext.USER_ROLE_HEADER, required = false) String role) {
        RequesterContext requester = RequesterContext.fromHeaders(userId, role);
        requester.checkIfJobSeeker();
        locationService.deleteLocation(companyId, locationId, requester.userId());
        return ResponseEntity.noContent().build();
    }
}
