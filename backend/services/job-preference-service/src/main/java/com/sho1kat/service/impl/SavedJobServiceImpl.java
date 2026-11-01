package com.sho1kat.service.impl;

import com.sho1kat.dto.jobPreferenceDto.request.SavedJobRequest;
import com.sho1kat.dto.jobPreferenceDto.response.SavedJobResponse;
import com.sho1kat.entity.SavedJob;
import com.sho1kat.exception.ApiException;
import com.sho1kat.mapper.SavedJobMapper;
import com.sho1kat.repository.SavedJobRepository;
import com.sho1kat.service.SavedJobService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SavedJobServiceImpl implements SavedJobService {

    private final SavedJobRepository savedJobRepository;
    private final SavedJobMapper savedJobMapper;

    @Override
    @Transactional
    public SavedJobResponse saveJob(Long candidateId, SavedJobRequest request) {
        // request.jobId/companyId are unverified ids until cross-service lookup
        // lands with the gateway (same stand-in as application-service apply).
        if (savedJobRepository.existsByCandidateIdAndJobId(candidateId, request.jobId())) {
            throw ApiException.conflict("Job " + request.jobId() + " is already saved");
        }
        SavedJob savedJob = savedJobRepository.save(savedJobMapper.toEntity(candidateId, request));
        return savedJobMapper.toResponse(savedJob);
    }

    @Override
    @Transactional
    public void unsaveJob(Long candidateId, Long savedJobId) {
        // owner-scoped lookup: other candidates answer 404, never delete rows
        SavedJob savedJob = savedJobRepository.findByIdAndCandidateId(savedJobId, candidateId)
                .orElseThrow(() -> ApiException.notFound("Saved job not found with id: " + savedJobId));
        savedJobRepository.delete(savedJob);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SavedJobResponse> getSavedJobs(Long candidateId) {
        return savedJobRepository.findByCandidateIdOrderBySavedAtDescIdDesc(candidateId)
                .stream()
                .map(savedJobMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isSaved(Long candidateId, Long jobId) {
        return savedJobRepository.existsByCandidateIdAndJobId(candidateId, jobId);
    }
}
