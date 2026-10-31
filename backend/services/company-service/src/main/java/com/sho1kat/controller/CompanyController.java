package com.sho1kat.controller;

import com.sho1kat.dto.companyServiceDto.request.CompanySearchCriteria;
import com.sho1kat.dto.companyServiceDto.request.CreateCompanyRequest;
import com.sho1kat.dto.companyServiceDto.request.UpdateCompanyRequest;
import com.sho1kat.dto.companyServiceDto.response.CompanyResponse;
import com.sho1kat.dto.companyServiceDto.response.DetailedCompanyResponse;
import com.sho1kat.client.CompanyService;
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
            @RequestHeader(name = RequesterId.HEADER, required = false) String ownerId,
            @Valid @RequestBody CreateCompanyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(companyService.createCompany(RequesterId.from(ownerId), request));
    }

    @GetMapping("/my-company")
    public ResponseEntity<DetailedCompanyResponse> getMyCompany(
            @RequestHeader(name = RequesterId.HEADER, required = false) String ownerId) {
        return ResponseEntity.ok(companyService.getMyCompany(RequesterId.from(ownerId)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DetailedCompanyResponse> updateCompany(
            @PathVariable Long id,
            @RequestHeader(name = RequesterId.HEADER, required = false) String requesterId,
            @Valid @RequestBody UpdateCompanyRequest request) {
        return ResponseEntity.ok(companyService.updateCompany(id, RequesterId.from(requesterId), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(
            @PathVariable Long id,
            @RequestHeader(name = RequesterId.HEADER, required = false) String requesterId) {
        companyService.deleteCompany(id, RequesterId.from(requesterId));
        return ResponseEntity.noContent().build();
    }
}
