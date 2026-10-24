package com.sho1kat.service.impl;

import com.sho1kat.dto.jobServiceDto.request.JobTagRequest;
import com.sho1kat.dto.jobServiceDto.response.JobTagResponse;
import com.sho1kat.entity.JobTag;
import com.sho1kat.exception.ApiException;
import com.sho1kat.mapper.JobTagMapper;
import com.sho1kat.repository.JobRepository;
import com.sho1kat.repository.JobTagRepository;
import com.sho1kat.service.JobTagService;
import com.sho1kat.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobTagServiceImpl implements JobTagService {

    private final JobTagRepository jobTagRepository;
    private final JobRepository jobRepository;
    private final JobTagMapper jobTagMapper;

    @Override
    @Transactional
    public JobTagResponse createJobTag(Long requesterId, JobTagRequest request) {
        verifyUserId(requesterId, "create a job tag");

        JobTag tag = jobTagMapper.toEntity(request, convertToSlug(request.name(), null));
        return jobTagMapper.toResponse(jobTagRepository.save(tag));
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobTagResponse> getAllJobTags() {
        return jobTagRepository.findAll(Sort.by("name").ascending())
                .stream()
                .map(jobTagMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public JobTagResponse getJobTagById(Long id) {
        return jobTagMapper.toResponse(requireTag(id));
    }

    @Override
    @Transactional
    public JobTagResponse updateJobTag(Long id, Long requesterId, JobTagRequest request) {
        verifyUserId(requesterId, "update a job tag");

        JobTag tag = requireTag(id);
        tag.setName(request.name().trim());
        return jobTagMapper.toResponse(jobTagRepository.save(tag)); // slug derived from name stays
    }

    @Override
    @Transactional
    public void deleteJobTag(Long id, Long requesterId) {
        verifyUserId(requesterId, "delete a job tag");

        JobTag tag = requireTag(id);
        if (jobRepository.existsActiveJobForTag(id)) {
            throw ApiException.conflict("Tag is still referenced by active jobs");
        }
        jobTagRepository.delete(tag);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobTag> getJobTagsByIds(Set<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        List<JobTag> found = jobTagRepository.findAllById(ids);
        if (found.size() != new LinkedHashSet<>(ids).size()) {
            Set<Long> missing = new LinkedHashSet<>(ids);
            missing.removeAll(found.stream().map(JobTag::getId).collect(Collectors.toList()));
            throw ApiException.badRequest("Unknown tag ids: " + missing);
        }
        return found;
    }

    // ---- helpers ----

    private JobTag requireTag(Long id) {
        return jobTagRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Job tag not found with id: " + id));
    }

    private void verifyUserId(Long id, String action) {
        if (id == null) {
            throw ApiException.unauthorized("Authentication is required to " + action);
        }
    }

    private String convertToSlug(String name, String currentSlug) {
        String base = SlugUtils.slugify(name, "tag");
        String candidate = base;
        int suffix = 2;
        while (jobTagRepository.existsBySlug(candidate) && !candidate.equals(currentSlug)) {
            candidate = base + "-" + suffix++;
        }
        return candidate;
    }
}
