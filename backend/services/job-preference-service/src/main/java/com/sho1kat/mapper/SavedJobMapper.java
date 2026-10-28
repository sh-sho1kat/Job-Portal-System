package com.sho1kat.mapper;

import com.sho1kat.dto.jobPreferenceDto.request.SavedJobRequest;
import com.sho1kat.dto.jobPreferenceDto.response.SavedJobResponse;
import com.sho1kat.entity.SavedJob;
import org.springframework.stereotype.Component;

@Component
public class SavedJobMapper {

    public SavedJob toEntity(Long candidateId, SavedJobRequest request) {
        return SavedJob.builder()
                .candidateId(candidateId)
                .jobId(request.jobId())
                .companyId(request.companyId())
                .notes(normalizeNotes(request.notes()))
                .build();
    }

    public SavedJobResponse toResponse(SavedJob savedJob) {
        return new SavedJobResponse(
                savedJob.getId(),
                savedJob.getCandidateId(),
                savedJob.getJobId(),
                savedJob.getCompanyId(),
                savedJob.getNotes(),
                savedJob.getSavedAt()
        );
    }

    /** Trims the note; blank notes are stored as {@code null}. */
    static String normalizeNotes(String notes) {
        if (notes == null) {
            return null;
        }
        String trimmed = notes.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
