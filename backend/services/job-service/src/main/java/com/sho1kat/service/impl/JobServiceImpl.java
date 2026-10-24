package com.sho1kat.service.impl;

import com.sho1kat.dto.jobServiceDto.request.CreateJobRequest;
import com.sho1kat.dto.jobServiceDto.request.JobSearchCriteria;
import com.sho1kat.dto.jobServiceDto.request.UpdateJobRequest;
import com.sho1kat.dto.jobServiceDto.response.DetailedJobResponse;
import com.sho1kat.dto.jobServiceDto.response.JobResponse;
import com.sho1kat.entity.Job;
import com.sho1kat.entity.JobCategory;
import com.sho1kat.entity.JobSkill;
import com.sho1kat.entity.JobTag;
import com.sho1kat.enums.JobStatus;
import com.sho1kat.enums.SalaryPeriod;
import com.sho1kat.enums.WorkMode;
import com.sho1kat.exception.ApiException;
import com.sho1kat.mapper.JobMapper;
import com.sho1kat.repository.JobCategoryRepository;
import com.sho1kat.repository.JobRepository;
import com.sho1kat.repository.JobSpecification;
import com.sho1kat.service.JobService;
import com.sho1kat.service.JobSkillService;
import com.sho1kat.service.JobTagService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final JobCategoryRepository jobCategoryRepository;
    private final JobSkillService jobSkillService;
    private final JobTagService jobTagService;
    private final JobMapper jobMapper;

    // ---- public ----

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> searchJobs(JobSearchCriteria criteria, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.clamp(size, 1, 100),
                Sort.by("createdAt").descending());
        return jobRepository.findAll(JobSpecification.publicSearch(criteria), pageable)
                .map(jobMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public JobResponse getJobById(Long id) {
        return jobMapper.toResponse(visibleJob(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getJobByCompanyId(Long companyId) {
        return jobRepository.findByCompanyIdAndDeletedAtIsNullOrderByCreatedAtDesc(companyId)
                .stream()
                .filter(this::isVisible)
                .map(jobMapper::toResponse)
                .toList();
    }

    // ---- employer / owner ----

    @Override
    @Transactional
    public DetailedJobResponse createJob(Long employerId, CreateJobRequest request) {

        verifyUserId(employerId, "post a job");

        // companyId (and company ownership) are not verified yet: job-service has no
        // company-service client until service discovery is wired up. Postings start
        // as DRAFT and only exist publicly once the employer publishes them.
        validate(request);
        JobCategory category = requireActiveCategory(request.categoryId());
        List<JobSkill> skills = jobSkillService.getJobSkillsByIds(request.skillIds());
        List<JobTag> tags = jobTagService.getJobTagsByIds(request.tagIds());

        Job job = jobMapper.toEntity(request, employerId, convertToSlug(request.title(), null), category, skills, tags);

        return jobMapper.toDetailedResponse(jobRepository.save(job));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DetailedJobResponse> getMyJobs(Long employerId, int page, int size) {
        verifyUserId(employerId, "view your jobs");

        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.clamp(size, 1, 100),
                Sort.by("createdAt").descending());
        return jobRepository.findByPostedByOwnerIdAndDeletedAtIsNull(employerId, pageable)
                .map(jobMapper::toDetailedResponse);
    }

    @Override
    @Transactional
    public DetailedJobResponse updateJob(Long jobId, Long requesterId, UpdateJobRequest request) {

        Job job = ownedJob(jobId, requesterId);

        validate(request);
        JobCategory category = requireActiveCategory(request.categoryId());
        List<JobSkill> skills = jobSkillService.getJobSkillsByIds(request.skillIds());
        List<JobTag> tags = jobTagService.getJobTagsByIds(request.tagIds());
        jobMapper.updateEntity(request, job, category, skills, tags);

        job.setSlug(convertToSlug(job.getTitle(), job.getSlug()));
        if (job.getStatus() == JobStatus.REJECTED) {
            // edits send rejected postings back to the drafts for re-publishing
            job.setStatus(JobStatus.DRAFT);
        }
        return jobMapper.toDetailedResponse(jobRepository.save(job));
    }

    @Override
    @Transactional
    public DetailedJobResponse publishJob(Long requesterId, Long jobId) {
        Job job = ownedJob(jobId, requesterId);
        if (job.getStatus() != JobStatus.DRAFT) {
            throw ApiException.badRequest("Only draft jobs can be published (current status: " + job.getStatus() + ")");
        }
        job.setStatus(JobStatus.ACTIVE);
        job.setPublishedAt(Instant.now());
        return jobMapper.toDetailedResponse(jobRepository.save(job));
    }

    @Override
    @Transactional
    public DetailedJobResponse closeJob(Long jobId, Long requesterId) {
        Job job = ownedJob(jobId, requesterId);
        if (job.getStatus() != JobStatus.ACTIVE) {
            throw ApiException.badRequest("Only active jobs can be closed (current status: " + job.getStatus() + ")");
        }
        job.setStatus(JobStatus.CLOSED);
        job.setClosedAt(Instant.now());
        return jobMapper.toDetailedResponse(jobRepository.save(job));
    }

    @Override
    @Transactional
    public void deleteJob(Long jobId, Long requesterId) {
        Job job = ownedJob(jobId, requesterId);
        job.setDeletedAt(Instant.now()); // soft delete; public queries filter on deletedAt
        jobRepository.save(job);
    }

    // ---- helpers ----

    private Job visibleJob(Long id) {
        return jobRepository.findById(id)
                .filter(this::isVisible)
                .orElseThrow(() -> ApiException.notFound("Job not found with id: " + id));
    }

    /**
     * A job is publicly visible while it is active, not deleted, and its
     * deadline and listing expiry (when set) have not yet passed.
     */
    private boolean isVisible(Job job) {
        LocalDate today = LocalDate.now();
        return job.getDeletedAt() == null
                && job.getStatus() == JobStatus.ACTIVE
                && (job.getApplicationDeadline() == null || !job.getApplicationDeadline().isBefore(today))
                && (job.getExpiresAt() == null || !job.getExpiresAt().isBefore(today));
    }

    private void validate(CreateJobRequest request) {
        validateSalary(request.salaryMin(), request.salaryMax(), request.salaryPeriod());
        validateWorkLocation(request.workMode(), request.city(), request.country());
    }

    private void validate(UpdateJobRequest request) {
        validateSalary(request.salaryMin(), request.salaryMax(), request.salaryPeriod());
        validateWorkLocation(request.workMode(), request.city(), request.country());
    }

    private void validateSalary(BigDecimal salaryMin, BigDecimal salaryMax, SalaryPeriod salaryPeriod) {
        if (salaryMin != null && salaryMax != null && salaryMin.compareTo(salaryMax) > 0) {
            throw ApiException.badRequest("salaryMin cannot exceed salaryMax");
        }
        if ((salaryMin != null || salaryMax != null) && salaryPeriod == null) {
            throw ApiException.badRequest("salaryPeriod is required when a salary is provided");
        }
    }

    private void validateWorkLocation(WorkMode workMode, String city, String country) {
        if (workMode != WorkMode.REMOTE && (isBlank(city) || isBlank(country))) {
            throw ApiException.badRequest(
                    "city and country are required for " + workMode + " jobs (only remote jobs may omit them)");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private JobCategory requireActiveCategory(Long categoryId) {
        JobCategory category = jobCategoryRepository.findById(categoryId)
                .orElseThrow(() -> ApiException.notFound("Job category not found with id: " + categoryId));
        if (!category.isActive()) {
            throw ApiException.badRequest("Job category is not active: " + category.getName());
        }
        return category;
    }

    private Job ownedJob(Long jobId, Long requesterId) {
        verifyUserId(requesterId, "manage this job");
        Job job = jobRepository.findById(jobId)
                .filter(j -> j.getDeletedAt() == null)
                .orElseThrow(() -> ApiException.notFound("Job not found with id: " + jobId));
        if (!job.getPostedByOwnerId().equals(requesterId)) {
            throw ApiException.forbidden("Only the employer who posted this job can manage it");
        }
        return job;
    }

    private void verifyUserId(Long id, String action) {
        if (id == null) {
            throw ApiException.unauthorized("Authentication is required to " + action);
        }
    }

    private String convertToSlug(String title, String currentSlug) {
        // Turn "Senior Java Developer" into "senior-java-developer", then extend with
        // -2, -3, ... until the slug is free. {@code currentSlug} is tolerated as a
        // candidate so renames that keep the same slug family do not loop.
        String base = slugify(title);
        String candidate = base;
        int suffix = 2;
        while (jobRepository.existsBySlug(candidate) && !candidate.equals(currentSlug)) {
            candidate = base + "-" + suffix++;
        }
        return candidate;
    }

    private String slugify(String value) {
        String slug = value.trim().toLowerCase()
                .replace("'", "")
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
        return slug.isBlank() ? "job" : slug;
    }
}
