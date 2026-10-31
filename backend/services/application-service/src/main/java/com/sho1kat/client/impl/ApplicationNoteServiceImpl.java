package com.sho1kat.client.impl;

import com.sho1kat.dto.applicationServiceDto.request.ApplicationNoteRequest;
import com.sho1kat.dto.applicationServiceDto.response.ApplicationNoteResponse;
import com.sho1kat.entity.Application;
import com.sho1kat.entity.ApplicationNote;
import com.sho1kat.exception.ApiException;
import com.sho1kat.mapper.ApplicationNoteMapper;
import com.sho1kat.repository.ApplicationNoteRepository;
import com.sho1kat.repository.ApplicationRepository;
import com.sho1kat.client.ApplicationNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationNoteServiceImpl implements ApplicationNoteService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationNoteRepository applicationNoteRepository;
    private final ApplicationNoteMapper applicationNoteMapper;

    @Override
    @Transactional
    public ApplicationNoteResponse addNote(Long applicationId, Long employerId, ApplicationNoteRequest request) {
        Application application = requireApplication(applicationId);
        ApplicationNote note = applicationNoteRepository.save(
                applicationNoteMapper.toEntity(application, employerId, request));
        return applicationNoteMapper.toResponse(note);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationNoteResponse> getNotesByApplication(Long applicationId, Long employerId) {
        requireApplication(applicationId);
        return applicationNoteRepository.findByApplicationIdOrderByCreatedAtAscIdAsc(applicationId)
                .stream()
                .map(applicationNoteMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationNoteResponse getNote(Long applicationId, Long noteId, Long employerId) {
        requireApplication(applicationId);
        return applicationNoteRepository.findByIdAndApplicationId(noteId, applicationId)
                .map(applicationNoteMapper::toResponse)
                .orElseThrow(() -> ApiException.notFound("Note not found with id: " + noteId));
    }

    @Override
    @Transactional
    public void deleteNote(Long applicationId, Long noteId, Long employerId) {
        requireApplication(applicationId);
        ApplicationNote note = applicationNoteRepository.findByIdAndApplicationId(noteId, applicationId)
                .orElseThrow(() -> ApiException.notFound("Note not found with id: " + noteId));
        // TODO: once the gateway forwards identity and roles, replace the
        //  author-only rule with role-aware checks (admins may moderate).
        if (!note.getAddedByUserId().equals(employerId)) {
            throw ApiException.forbidden("Only the note author can delete it");
        }
        applicationNoteRepository.delete(note);
    }

    // ---- helpers ----

    /**
     * Notes address the application id directly; company membership of the
     * acting employer is unverified until identity enforcement lands (TODO).
     */
    private Application requireApplication(Long applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> ApiException.notFound("Application not found with id: " + applicationId));
    }
}
