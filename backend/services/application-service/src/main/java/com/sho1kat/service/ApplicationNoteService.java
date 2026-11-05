package com.sho1kat.service;

import com.sho1kat.dto.applicationServiceDto.request.ApplicationNoteRequest;
import com.sho1kat.dto.applicationServiceDto.response.ApplicationNoteResponse;
import com.sho1kat.enums.UserRole;

import java.util.List;

public interface ApplicationNoteService {

    ApplicationNoteResponse addNote(Long applicationId, Long ownerId, ApplicationNoteRequest request);

    List<ApplicationNoteResponse> getNotesByApplication(Long applicationId, Long ownerId);

    ApplicationNoteResponse getNote(Long applicationId, Long noteId, Long ownerId);

    void deleteNote(Long applicationId, Long noteId, Long ownerId);
}
