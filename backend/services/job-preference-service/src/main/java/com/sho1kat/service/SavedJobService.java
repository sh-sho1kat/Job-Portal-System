package com.sho1kat.service;

import com.sho1kat.dto.jobPreferenceDto.request.SavedJobRequest;
import com.sho1kat.dto.jobPreferenceDto.response.SavedJobResponse;

import java.util.List;

/**
 * Candidate job bookmarks ("saved jobs"). All operations are scoped by the
 * candidate id resolved from the {@code X-User-Id} stand-in header.
 */
public interface SavedJobService {

    /** Saves a job for the candidate; saving the same job twice answers 409. */
    SavedJobResponse saveJob(Long candidateId, SavedJobRequest request);

    /** Removes a bookmark; rows of other candidates answer 404. */
    void unsaveJob(Long candidateId, Long savedJobId);

    /** The candidate's bookmarks, newest first. */
    List<SavedJobResponse> getSavedJobs(Long candidateId);

    /** Whether the candidate has the job bookmarked. */
    boolean isSaved(Long candidateId, Long jobId);
}
