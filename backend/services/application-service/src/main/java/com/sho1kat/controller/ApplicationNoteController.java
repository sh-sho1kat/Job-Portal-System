package com.sho1kat.controller;

import com.sho1kat.dto.applicationServiceDto.request.ApplicationNoteRequest;
import com.sho1kat.dto.applicationServiceDto.response.ApplicationNoteResponse;
import com.sho1kat.service.ApplicationNoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Employer-side internal notes on one application. The acting employer's id
 * comes from the temporary {@code X-User-Id} stand-in (needed on every note
 * call); notes are private to the hiring team, so candidates never receive
 * them in their own views.
 */
@RestController
@RequestMapping("/api/applications/{applicationId}/notes")
@RequiredArgsConstructor
public class ApplicationNoteController {

    private final ApplicationNoteService applicationNoteService;

    /** All notes of the application, oldest first. */
    @GetMapping
    public ResponseEntity<List<ApplicationNoteResponse>> getNotes(
            @PathVariable Long applicationId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String requesterId) {
        return ResponseEntity.ok(applicationNoteService.getNotesByApplication(
                applicationId, RequesterId.from(requesterId)));
    }

    /** 201 created; the note records its author (the {@code X-User-Id} caller). */
    @PostMapping
    public ResponseEntity<ApplicationNoteResponse> addNote(
            @PathVariable Long applicationId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String requesterId,
            @Valid @RequestBody ApplicationNoteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(applicationNoteService.addNote(applicationId, RequesterId.from(requesterId), request));
    }

    /** Single note by id. */
    @GetMapping("/{noteId}")
    public ResponseEntity<ApplicationNoteResponse> getNote(
            @PathVariable Long applicationId,
            @PathVariable Long noteId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String requesterId) {
        return ResponseEntity.ok(applicationNoteService.getNote(
                applicationId, noteId, RequesterId.from(requesterId)));
    }

    /** 204; only the note author may delete their own note (403 otherwise). */
    @DeleteMapping("/{noteId}")
    public ResponseEntity<Void> deleteNote(
            @PathVariable Long applicationId,
            @PathVariable Long noteId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String requesterId) {
        applicationNoteService.deleteNote(applicationId, noteId, RequesterId.from(requesterId));
        return ResponseEntity.noContent().build();
    }
}
