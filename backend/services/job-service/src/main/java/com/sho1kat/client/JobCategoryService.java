package com.sho1kat.client;

import com.sho1kat.dto.jobServiceDto.request.JobCategoryRequest;
import com.sho1kat.dto.jobServiceDto.response.JobCategoryResponse;

import java.util.List;

public interface JobCategoryService {
    JobCategoryResponse createJobCategory(Long requesterId, JobCategoryRequest request);

    /** Active categories as a tree (public dropdown navigation). */
    List<JobCategoryResponse> getAllJobCategories();

    /** Flat list including inactive ones (management screens). */
    List<JobCategoryResponse> getAllJobCategoriesIncludingInactive();

    JobCategoryResponse getJobCategoryById(Long id);

    JobCategoryResponse updateJobCategory(Long id, Long requesterId, JobCategoryRequest request);

    void deleteJobCategory(Long id, Long requesterId);
}
