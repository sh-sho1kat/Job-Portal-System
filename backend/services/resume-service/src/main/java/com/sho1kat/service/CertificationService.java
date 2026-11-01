package com.sho1kat.service;

import com.sho1kat.dto.ResumeServiceDto.request.CertificationRequest;
import com.sho1kat.dto.ResumeServiceDto.response.CertificationResponse;

import java.util.List;

public interface CertificationService {

    CertificationResponse addCertification(Long resumeId, Long candidateId, CertificationRequest request);

    List<CertificationResponse> getCertifications(Long resumeId, Long candidateId);

    CertificationResponse updateCertification(Long certificationId, Long resumeId, Long candidateId,
                                               CertificationRequest request);

    void deleteCertification(Long certificationId, Long resumeId, Long candidateId);
}
