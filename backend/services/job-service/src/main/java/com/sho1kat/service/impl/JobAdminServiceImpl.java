package com.sho1kat.service.impl;

import com.sho1kat.dto.jobServiceDto.response.DetailedJobResponse;
import com.sho1kat.entity.Job;
import com.sho1kat.enums.JobStatus;
import com.sho1kat.exception.ApiException;
import com.sho1kat.mapper.JobMapper;
import com.sho1kat.repository.JobRepository;
import com.sho1kat.service.JobAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobAdminServiceImpl implements JobAdminService {

    private final JobRepository jobRepository;
    private final JobMapper jobMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<DetailedJobResponse> listJobs(JobStatus status, Long companyId, String title, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.clamp(size, 1, 100),
                Sort.by("createdAt").descending());

        List<Specification<Job>> parts = new ArrayList<>();
        parts.add((root, query, cb) -> cb.isNull(root.<String>get("deletedAt")));
        if (status != null) {
            parts.add((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (companyId != null) {
            parts.add((root, query, cb) -> cb.equal(root.get("companyId"), companyId));
        }
        if (title != null && !title.isBlank()) {
            String pattern = "%" + title.trim().toLowerCase() + "%";
            parts.add((root, query, cb) -> cb.like(cb.lower(root.<String>get("title")), pattern));
        }

        return jobRepository.findAll(Specification.allOf(parts), pageable)
                .map(jobMapper::toDetailedResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public DetailedJobResponse getJob(Long jobId) {
        return jobMapper.toDetailedResponse(requireJob(jobId));
    }

    /** ACTIVE -> SUSPENDED */
    @Override
    @Transactional
    public DetailedJobResponse suspend(Long jobId, String reason) {
        Job job = requireJob(jobId);
        requireStatus(job, JobStatus.ACTIVE, "Only active jobs can be suspended");
        job.setStatus(JobStatus.SUSPENDED);
        log.info("Job {} suspended: {}", jobId, reason);
        return jobMapper.toDetailedResponse(jobRepository.save(job));
    }

    /** SUSPENDED -> ACTIVE */
    @Override
    @Transactional
    public DetailedJobResponse reactivate(Long jobId) {
        Job job = requireJob(jobId);
        requireStatus(job, JobStatus.SUSPENDED, "Only suspended jobs can be reactivated");
        job.setStatus(JobStatus.ACTIVE);
        log.info("Job {} reactivated", jobId);
        return jobMapper.toDetailedResponse(jobRepository.save(job));
    }

    // ---- helpers ----

    private Job requireJob(Long jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> ApiException.notFound("Job not found with id: " + jobId));
    }

    private void requireStatus(Job job, JobStatus expected, String message) {
        if (job.getStatus() != expected) {
            throw ApiException.badRequest(message + " (current status: " + job.getStatus() + ")");
        }
    }
}
