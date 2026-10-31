package com.sho1kat.client.impl;

import com.sho1kat.dto.ResumeServiceDto.request.CertificationRequest;
import com.sho1kat.dto.ResumeServiceDto.response.CertificationResponse;
import com.sho1kat.entity.Certification;
import com.sho1kat.entity.Resume;
import com.sho1kat.exception.ApiException;
import com.sho1kat.mapper.CertificationMapper;
import com.sho1kat.repository.CertificationRepository;
import com.sho1kat.client.CertificationService;
import com.sho1kat.client.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CertificationServiceImpl implements CertificationService {

    private final ResumeService resumeService;
    private final CertificationRepository certificationRepository;
    private final CertificationMapper certificationMapper;

    @Override
    @Transactional
    public CertificationResponse addCertification(Long resumeId, Long candidateId,
                                                  CertificationRequest request) {
        Resume resume = resumeService.requireOwnedResume(resumeId, candidateId);
        validate(request);
        Certification certification = certificationRepository.save(
                certificationMapper.toEntity(resume, request));
        resumeService.refreshCompletionScore(resume);
        return certificationMapper.toResponse(certification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CertificationResponse> getCertifications(Long resumeId, Long candidateId) {
        Resume resume = resumeService.requireOwnedResume(resumeId, candidateId);
        return certificationRepository.findByResumeIdOrderByDisplayOrderAscIdAsc(resume.getId())
                .stream()
                .map(certificationMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public CertificationResponse updateCertification(Long certificationId, Long resumeId, Long candidateId,
                                                     CertificationRequest request) {
        Resume resume = resumeService.requireOwnedResume(resumeId, candidateId);
        Certification certification = requireCertification(certificationId, resume.getId());
        validate(request);
        certificationMapper.updateEntity(request, certification);
        Certification saved = certificationRepository.save(certification);
        resumeService.refreshCompletionScore(resume);
        return certificationMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteCertification(Long certificationId, Long resumeId, Long candidateId) {
        Resume resume = resumeService.requireOwnedResume(resumeId, candidateId);
        Certification certification = requireCertification(certificationId, resume.getId());
        certificationRepository.delete(certification);
        resumeService.refreshCompletionScore(resume);
    }

    // ---- helpers ----

    private Certification requireCertification(Long certificationId, Long resumeId) {
        return certificationRepository.findByIdAndResumeId(certificationId, resumeId)
                .orElseThrow(() -> ApiException.notFound("Certification not found with id: " + certificationId));
    }

    private void validate(CertificationRequest request) {
        if (request.expirationDate() != null && request.expirationDate().isBefore(request.issueDate())) {
            throw ApiException.badRequest("expirationDate cannot be before issueDate");
        }
    }
}
