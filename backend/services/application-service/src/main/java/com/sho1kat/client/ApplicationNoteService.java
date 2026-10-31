package com.sho1kat.client;

import com.sho1kat.dto.applicationServiceDto.request.ApplicationNoteRequest;
import com.sho1kat.dto.applicationServiceDto.response.ApplicationNoteResponse;

import java.util.List;

public interface ApplicationNoteService {

    ApplicationNoteResponse addNote(Long applicationId, Long employerId, ApplicationNoteRequest request);

    List<ApplicationNoteResponse> getNotesByApplication(Long applicationId, Long employerId);

    ApplicationNoteResponse getNote(Long applicationId, Long noteId, Long employerId);

    void deleteNote(Long applicationId, Long noteId, Long employerId);
}
