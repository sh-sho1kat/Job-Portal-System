package com.sho1kat.service.impl;

import com.sho1kat.dto.jobServiceDto.request.JobSkillRequest;
import com.sho1kat.dto.jobServiceDto.response.JobSkillResponse;
import com.sho1kat.entity.JobSkill;
import com.sho1kat.exception.ApiException;
import com.sho1kat.mapper.JobSkillMapper;
import com.sho1kat.repository.JobRepository;
import com.sho1kat.repository.JobSkillRepository;
import com.sho1kat.service.JobSkillService;
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
public class JobSkillServiceImpl implements JobSkillService {

    private final JobSkillRepository jobSkillRepository;
    private final JobRepository jobRepository;
    private final JobSkillMapper jobSkillMapper;

    @Override
    @Transactional
    public JobSkillResponse createJobSkill(Long requesterId, JobSkillRequest request) {
        verifyUserId(requesterId, "create a job skill");

        JobSkill skill = jobSkillMapper.toEntity(request, convertToSlug(request.name(), null));
        return jobSkillMapper.toResponse(jobSkillRepository.save(skill));
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobSkillResponse> getAllJobSkills() {
        return jobSkillRepository.findAll(Sort.by("name").ascending())
                .stream()
                .filter(JobSkill::isActive)
                .map(jobSkillMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobSkillResponse> getAllJobSkillsIncludingInactive() {
        return jobSkillRepository.findAll(Sort.by("name").ascending())
                .stream()
                .map(jobSkillMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public JobSkillResponse getJobSkillById(Long id) {
        return jobSkillMapper.toResponse(requireSkill(id));
    }

    @Override
    @Transactional
    public JobSkillResponse updateJobSkill(Long id, Long requesterId, JobSkillRequest request) {
        verifyUserId(requesterId, "update a job skill");

        JobSkill skill = requireSkill(id);
        jobSkillMapper.updateEntity(request, skill);
        return jobSkillMapper.toResponse(jobSkillRepository.save(skill));
    }

    @Override
    @Transactional
    public void deleteJobSkill(Long id, Long requesterId) {
        verifyUserId(requesterId, "delete a job skill");

        JobSkill skill = requireSkill(id);
        if (jobRepository.existsActiveJobForSkill(id)) {
            throw ApiException.conflict("Skill is still referenced by job postings; deactivate it instead");
        }
        jobSkillRepository.delete(skill);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobSkill> getJobSkillsByIds(Set<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        List<JobSkill> found = jobSkillRepository.findAllById(ids);
        if (found.size() != new LinkedHashSet<>(ids).size()) {
            Set<Long> missing = new LinkedHashSet<>(ids);
            missing.removeAll(found.stream().map(JobSkill::getId).collect(Collectors.toList()));
            throw ApiException.badRequest("Unknown skill ids: " + missing);
        }
        return found;
    }

    // ---- helpers ----

    private JobSkill requireSkill(Long id) {
        return jobSkillRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Job skill not found with id: " + id));
    }

    private void verifyUserId(Long id, String action) {
        if (id == null) {
            throw ApiException.unauthorized("Authentication is required to " + action);
        }
    }

    private String convertToSlug(String name, String currentSlug) {
        String base = SlugUtils.slugify(name, "skill");
        String candidate = base;
        int suffix = 2;
        while (jobSkillRepository.existsBySlug(candidate) && !candidate.equals(currentSlug)) {
            candidate = base + "-" + suffix++;
        }
        return candidate;
    }
}
