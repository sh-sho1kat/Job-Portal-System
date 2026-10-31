package com.sho1kat.client;

import com.sho1kat.dto.jobServiceDto.request.JobTagRequest;
import com.sho1kat.dto.jobServiceDto.response.JobTagResponse;
import com.sho1kat.entity.JobTag;

import java.util.List;

public interface JobTagService {
    JobTagResponse createJobTag(Long requesterId, JobTagRequest request);

    List<JobTagResponse> getAllJobTags();

    JobTagResponse getJobTagById(Long id);

    JobTagResponse updateJobTag(Long id, Long requesterId, JobTagRequest request);

    void deleteJobTag(Long id, Long requesterId);

    /** Resolves every id for a posting; throws if any id is unknown. */
    List<JobTag> getJobTagsByIds(java.util.Set<Long> ids);
}
