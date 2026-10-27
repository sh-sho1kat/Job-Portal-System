package com.sho1kat.service.impl;

import com.sho1kat.dto.ResumeServiceDto.request.AwardRequest;
import com.sho1kat.dto.ResumeServiceDto.response.AwardResponse;
import com.sho1kat.entity.Award;
import com.sho1kat.entity.Resume;
import com.sho1kat.exception.ApiException;
import com.sho1kat.mapper.AwardMapper;
import com.sho1kat.repository.AwardRepository;
import com.sho1kat.service.AwardService;
import com.sho1kat.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AwardServiceImpl implements AwardService {

    private final ResumeService resumeService;
    private final AwardRepository awardRepository;
    private final AwardMapper awardMapper;

    @Override
    @Transactional
    public AwardResponse addAward(Long resumeId, Long candidateId, AwardRequest request) {
        Resume resume = resumeService.requireOwnedResume(resumeId, candidateId);
        Award award = awardRepository.save(awardMapper.toEntity(resume, request));
        resumeService.refreshCompletionScore(resume);
        return awardMapper.toResponse(award);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AwardResponse> getAwards(Long resumeId, Long candidateId) {
        Resume resume = resumeService.requireOwnedResume(resumeId, candidateId);
        return awardRepository.findByResumeIdOrderByDisplayOrderAscIdAsc(resume.getId())
                .stream()
                .map(awardMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public AwardResponse updateAward(Long awardId, Long resumeId, Long candidateId, AwardRequest request) {
        Resume resume = resumeService.requireOwnedResume(resumeId, candidateId);
        Award award = requireAward(awardId, resume.getId());
        awardMapper.updateEntity(request, award);
        Award saved = awardRepository.save(award);
        resumeService.refreshCompletionScore(resume);
        return awardMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteAward(Long awardId, Long resumeId, Long candidateId) {
        Resume resume = resumeService.requireOwnedResume(resumeId, candidateId);
        Award award = requireAward(awardId, resume.getId());
        awardRepository.delete(award);
        resumeService.refreshCompletionScore(resume);
    }

    // ---- helpers ----

    private Award requireAward(Long awardId, Long resumeId) {
        return awardRepository.findByIdAndResumeId(awardId, resumeId)
                .orElseThrow(() -> ApiException.notFound("Award not found with id: " + awardId));
    }
}
