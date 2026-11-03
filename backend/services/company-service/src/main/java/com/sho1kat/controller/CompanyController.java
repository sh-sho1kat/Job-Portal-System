package com.sho1kat.controller;

import com.sho1kat.dto.MessageResponse;
import com.sho1kat.dto.companyServiceDto.request.CompanySearchCriteria;
import com.sho1kat.dto.companyServiceDto.request.CreateCompanyRequest;
import com.sho1kat.dto.companyServiceDto.request.UpdateCompanyRequest;
import com.sho1kat.dto.companyServiceDto.response.CompanyResponse;
import com.sho1kat.dto.companyServiceDto.response.DetailedCompanyResponse;
import com.sho1kat.security.RequesterContext;
import com.sho1kat.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    // ---- public ----

    @GetMapping
    public ResponseEntity<Page<CompanyResponse>> searchCompanies(
            @ModelAttribute CompanySearchCriteria criteria,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(companyService.searchCompanies(criteria, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponse> getCompanyById(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getCompanyById(id));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<CompanyResponse> getCompanyBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(companyService.getCompanyBySlug(slug));
    }

    // ---- employer / owner ----
    @PostMapping("/create")
    public ResponseEntity<DetailedCompanyResponse> createCompany(
            @RequestHeader(name = RequesterContext.USER_ID_HEADER, required = false) String userId,
            @RequestHeader(name = RequesterContext.USER_ROLE_HEADER, required = false) String role,
            @Valid @RequestBody CreateCompanyRequest request) {
        RequesterContext requester = RequesterContext.fromHeaders(userId, role);
        requester.checkIfJobSeeker();
        return ResponseEntity.ok(companyService.createCompany(requester.userId(), request));
    }

    @GetMapping("/my-company")
    public ResponseEntity<DetailedCompanyResponse> getMyCompany(
            @RequestHeader(name = "X-User-Id", required = false) String ownerId,
            @RequestHeader(name = "X-User-Role", required = false) String role) {
        RequesterContext requester = RequesterContext.fromHeaders(ownerId, role);
        requester.checkIfJobSeeker();
        return ResponseEntity.ok(companyService.getMyCompany(requester.userId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DetailedCompanyResponse> updateCompany(
            @RequestHeader(name = RequesterContext.USER_ID_HEADER, required = false) String userId,
            @RequestHeader(name = RequesterContext.USER_ROLE_HEADER, required = false) String role,
            @PathVariable Long id,
            @Valid @RequestBody UpdateCompanyRequest request) {
        RequesterContext requester = RequesterContext.fromHeaders(userId, role);
        requester.checkIfJobSeeker();
        return ResponseEntity.ok(companyService.updateCompany(id, requester.userId(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteCompany(
            @RequestHeader(name = RequesterContext.USER_ID_HEADER, required = false) String userId,
            @RequestHeader(name = RequesterContext.USER_ROLE_HEADER, required = false) String role,
            @PathVariable Long id) {
        RequesterContext requester = RequesterContext.fromHeaders(userId, role);
        requester.checkIfJobSeeker();
        companyService.deleteCompany(id, requester.userId());
        return ResponseEntity.ok(new MessageResponse("Company deleted successfully"));
    }
}
