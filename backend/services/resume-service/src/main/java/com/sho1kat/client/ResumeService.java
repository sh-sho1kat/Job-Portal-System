package com.sho1kat.client;

import com.sho1kat.dto.ResumeServiceDto.request.ResumeRequest;
import com.sho1kat.dto.ResumeServiceDto.request.PersonalInfoRequest;
import com.sho1kat.dto.ResumeServiceDto.request.UpdateResumeRequest;
import com.sho1kat.dto.ResumeServiceDto.request.UpdateSummaryRequest;
import com.sho1kat.dto.ResumeServiceDto.response.ResumeResponse;
import com.sho1kat.entity.Resume;

import java.util.List;

public interface ResumeService {

    ResumeResponse createResume(Long candidateId, ResumeRequest request);

    /** All surviving resumes of the candidate, default one first. */
    List<ResumeResponse> getMyResumes(Long candidateId);

    /** Detailed resume (all subsections) plus a last-viewed touch. */
    ResumeResponse getResumeById(Long resumeId, Long candidateId);

    ResumeResponse updateResume(Long resumeId, Long candidateId, UpdateResumeRequest request);

    /** Patch-style: only supplied fields change. */
    ResumeResponse updatePersonalInfo(Long resumeId, Long candidateId, PersonalInfoRequest request);

    /** Replaces (or clears with {@code null}) the professional summary. */
    ResumeResponse updateSummary(Long resumeId, Long candidateId, UpdateSummaryRequest request);

    /** Marks this résumé as the apply-with default, demoting every other. */
    ResumeResponse setDefaultResume(Long resumeId, Long candidateId);

    /** Soft delete; the newest remaining resume becomes the default. */
    void deleteResume(Long resumeId, Long candidateId);

    // ---- shared helpers for the sub-section services ----

    /** Resolves a résumé owned by the candidate; 404 otherwise. */
    Resume requireOwnedResume(Long resumeId, Long candidateId);

    /** Recalculates the 0-100 completion score and persists the resume. */
    void refreshCompletionScore(Resume resume);
}
