package com.sho1kat.mapper;

import com.sho1kat.dto.ResumeServiceDto.request.CertificationRequest;
import com.sho1kat.dto.ResumeServiceDto.response.CertificationResponse;
import com.sho1kat.entity.Certification;
import com.sho1kat.entity.Resume;
import org.springframework.stereotype.Component;

@Component
public class CertificationMapper {

    public Certification toEntity(Resume resume, CertificationRequest request) {
        return Certification.builder()
                .resume(resume)
                .name(request.name().trim())
                .issuingOrganization(trim(request.issuingOrganization()))
                .issueDate(request.issueDate())
                .expirationDate(request.expirationDate())
                .credentialId(trim(request.credentialId()))
                .credentialUrl(request.credentialUrl())
                .displayOrder(request.displayOrder() == null ? 0 : request.displayOrder())
                .build();
    }

    public void updateEntity(CertificationRequest request, Certification certification) {
        certification.setName(request.name().trim());
        certification.setIssuingOrganization(trim(request.issuingOrganization()));
        certification.setIssueDate(request.issueDate());
        certification.setExpirationDate(request.expirationDate());
        certification.setCredentialId(trim(request.credentialId()));
        certification.setCredentialUrl(request.credentialUrl());
        certification.setDisplayOrder(request.displayOrder() == null ? 0 : request.displayOrder());
    }

    public CertificationResponse toResponse(Certification certification) {
        return new CertificationResponse(
                certification.getId(),
                certification.getName(),
                certification.getIssuingOrganization(),
                certification.getIssueDate(),
                certification.getExpirationDate(),
                certification.getCredentialId(),
                certification.getCredentialUrl(),
                certification.getDisplayOrder(),
                certification.getCreatedAt(),
                certification.getUpdatedAt()
        );
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }
}
