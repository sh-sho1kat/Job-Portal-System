package com.sho1kat.service.impl;

import com.sho1kat.dto.applicationServiceDto.request.ApplicationNoteRequest;
import com.sho1kat.dto.applicationServiceDto.response.ApplicationNoteResponse;
import com.sho1kat.entity.Application;
import com.sho1kat.entity.ApplicationNote;
import com.sho1kat.exception.ApiException;
import com.sho1kat.mapper.ApplicationNoteMapper;
import com.sho1kat.repository.ApplicationNoteRepository;
import com.sho1kat.repository.ApplicationRepository;
import com.sho1kat.service.ApplicationNoteService;
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
    public ApplicationNoteResponse addNote(Long applicationId, Long ownerId, ApplicationNoteRequest request) {
        Application application = requireApplication(applicationId);
        ApplicationNote note = applicationNoteRepository.save(
                applicationNoteMapper.toEntity(application, ownerId, request));
        return applicationNoteMapper.toResponse(note);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationNoteResponse> getNotesByApplication(Long applicationId, Long ownerId) {
        requireApplication(applicationId);
        return applicationNoteRepository.findByApplicationIdAndAuthorIdOrderByCreatedAtAscIdAsc(applicationId, ownerId)
                .stream()
                .map(applicationNoteMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationNoteResponse getNote(Long applicationId, Long noteId, Long ownerId) {
        requireApplication(applicationId);
        return applicationNoteRepository.findByIdAndApplicationIdAndAuthorId(noteId, applicationId, ownerId)
                .map(applicationNoteMapper::toResponse)
                .orElseThrow(() -> ApiException.notFound("Note not found with id: " + noteId));
    }

    @Override
    @Transactional
    public void deleteNote(Long applicationId, Long noteId, Long ownerId) {
        requireApplication(applicationId);
        ApplicationNote note = applicationNoteRepository.findByIdAndApplicationIdAndAuthorId(noteId, applicationId, ownerId)
                .orElseThrow(() -> ApiException.notFound("Note not found with id: " + noteId));

        if (!note.getAuthorId().equals(ownerId)) {
            throw ApiException.forbidden("Only the note author can delete it");
        }
        applicationNoteRepository.delete(note);
    }

    private Application requireApplication(Long applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> ApiException.notFound("Application not found with id: " + applicationId));
    }
}
