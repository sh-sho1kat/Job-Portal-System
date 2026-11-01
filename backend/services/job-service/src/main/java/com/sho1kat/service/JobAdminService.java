package com.sho1kat.service;

import com.sho1kat.dto.jobServiceDto.response.DetailedJobResponse;
import com.sho1kat.enums.JobStatus;
import org.springframework.data.domain.Page;

public interface JobAdminService {
    Page<DetailedJobResponse> listJobs(JobStatus status, Long companyId, String title, int page, int size);

    DetailedJobResponse getJob(Long jobId);

    /** ACTIVE -> SUSPENDED */
    DetailedJobResponse suspend(Long jobId, String reason);

    /** SUSPENDED -> ACTIVE */
    DetailedJobResponse reactivate(Long jobId);
}
