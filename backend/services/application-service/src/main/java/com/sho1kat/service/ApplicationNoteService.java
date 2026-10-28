package com.sho1kat.service;

import com.sho1kat.dto.applicationServiceDto.request.ApplicationNoteRequest;
import com.sho1kat.dto.applicationServiceDto.response.ApplicationNoteResponse;

import java.util.List;

/**
 * Employer-side internal notes on one application. The acting employer comes
 * from the temporary {@code X-User-Id} stand-in; notes are provenance-tagged
 * with the author id and only the author may delete their own note.
 */
public interface ApplicationNoteService {

    ApplicationNoteResponse addNote(Long applicationId, Long employerId, ApplicationNoteRequest request);

    /** All notes of the application, oldest first. */
    List<ApplicationNoteResponse> getNotesByApplication(Long applicationId, Long employerId);

    ApplicationNoteResponse getNote(Long applicationId, Long noteId, Long employerId);

    /** 204; author-only. */
    void deleteNote(Long applicationId, Long noteId, Long employerId);
}
