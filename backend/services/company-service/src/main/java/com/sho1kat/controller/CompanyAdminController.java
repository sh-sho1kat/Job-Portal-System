package com.sho1kat.controller;

import com.sho1kat.dto.companyServiceDto.response.DetailedCompanyResponse;
import com.sho1kat.enums.CompanyStatus;
import com.sho1kat.service.CompanyAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/companies")
@RequiredArgsConstructor
public class CompanyAdminController {

    private final CompanyAdminService companyAdminService;

    @GetMapping
    public ResponseEntity<Page<DetailedCompanyResponse>> listCompanies(
            @RequestParam(required = false) CompanyStatus status,
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(companyAdminService.listCompanies(status, name, page, size));
    }

    @GetMapping("/{companyId}")
    public ResponseEntity<DetailedCompanyResponse> getCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(companyAdminService.getCompany(companyId));
    }

    /** PENDING_VERIFICATION -> ACTIVE */
    @PostMapping("/{companyId}/approve")
    public ResponseEntity<DetailedCompanyResponse> approve(@PathVariable Long companyId) {
        return ResponseEntity.ok(companyAdminService.approve(companyId));
    }

    /** PENDING_VERIFICATION -> REJECTED */
    @PostMapping("/{companyId}/reject")
    public ResponseEntity<DetailedCompanyResponse> reject(@PathVariable Long companyId,
                                                          @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(companyAdminService.reject(companyId, reason));
    }

    /** ACTIVE -> SUSPENDED */
    @PostMapping("/{companyId}/suspend")
    public ResponseEntity<DetailedCompanyResponse> suspend(@PathVariable Long companyId,
                                                           @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(companyAdminService.suspend(companyId, reason));
    }

    /** SUSPENDED -> ACTIVE */
    @PostMapping("/{companyId}/reactivate")
    public ResponseEntity<DetailedCompanyResponse> reactivate(@PathVariable Long companyId) {
        return ResponseEntity.ok(companyAdminService.reactivate(companyId));
    }
}
