package com.sho1kat.controller;

import com.sho1kat.dto.ResumeServiceDto.request.CertificationRequest;
import com.sho1kat.dto.ResumeServiceDto.response.CertificationResponse;
import com.sho1kat.client.CertificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Certifications of one resume; every endpoint is owner-scoped.
 */
@RestController
@RequestMapping("/api/resumes/{resumeId}/certifications")
@RequiredArgsConstructor
public class CertificationController {

    private final CertificationService certificationService;

    @GetMapping
    public ResponseEntity<List<CertificationResponse>> getCertifications(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId) {
        return ResponseEntity.ok(
                certificationService.getCertifications(resumeId, RequesterId.from(candidateId)));
    }

    @PostMapping
    public ResponseEntity<CertificationResponse> addCertification(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId,
            @Valid @RequestBody CertificationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(certificationService.addCertification(
                        resumeId, RequesterId.from(candidateId), request));
    }

    @PutMapping("/{certificationId}")
    public ResponseEntity<CertificationResponse> updateCertification(
            @PathVariable Long resumeId,
            @PathVariable Long certificationId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId,
            @Valid @RequestBody CertificationRequest request) {
        return ResponseEntity.ok(certificationService.updateCertification(
                certificationId, resumeId, RequesterId.from(candidateId), request));
    }

    @DeleteMapping("/{certificationId}")
    public ResponseEntity<Void> deleteCertification(
            @PathVariable Long resumeId,
            @PathVariable Long certificationId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId) {
        certificationService.deleteCertification(certificationId, resumeId, RequesterId.from(candidateId));
        return ResponseEntity.noContent().build();
    }
}
