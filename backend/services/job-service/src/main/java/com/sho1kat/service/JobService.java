package com.sho1kat.service;

import com.sho1kat.dto.jobServiceDto.request.CreateJobRequest;
import com.sho1kat.dto.jobServiceDto.request.JobSearchCriteria;
import com.sho1kat.dto.jobServiceDto.request.UpdateJobRequest;
import com.sho1kat.dto.jobServiceDto.response.DetailedJobResponse;
import com.sho1kat.dto.jobServiceDto.response.JobResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface JobService {
    // ---- public ----
    Page<JobResponse> searchJobs(JobSearchCriteria criteria, int page, int size);

    JobResponse getJobById(Long id);

    /** Public job listings of one company (active, not expired). */
    List<JobResponse> getJobByCompanyId(Long companyId);

    // ---- employer / owner ----
    DetailedJobResponse createJob(Long employerId, CreateJobRequest request);

    Page<DetailedJobResponse> getMyJobs(Long employerId, int page, int size);

    DetailedJobResponse updateJob(Long jobId, Long requesterId, UpdateJobRequest request);

    /** DRAFT -> ACTIVE */
    DetailedJobResponse publishJob(Long requesterId, Long jobId);

    /** ACTIVE -> CLOSED */
    DetailedJobResponse closeJob(Long jobId, Long requesterId);

    void deleteJob(Long jobId, Long requesterId);
}
