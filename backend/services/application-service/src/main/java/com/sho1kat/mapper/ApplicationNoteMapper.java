package com.sho1kat.mapper;

import com.sho1kat.dto.applicationServiceDto.request.ApplicationNoteRequest;
import com.sho1kat.dto.applicationServiceDto.response.ApplicationNoteResponse;
import com.sho1kat.entity.Application;
import com.sho1kat.entity.ApplicationNote;
import org.springframework.stereotype.Component;

@Component
public class ApplicationNoteMapper {

    public ApplicationNote toEntity(Application application, Long addedByUserId, ApplicationNoteRequest request) {
        return ApplicationNote.builder()
                .application(application)
                .addedByUserId(addedByUserId)
                .content(request.content().trim())
                .build();
    }

    public ApplicationNoteResponse toResponse(ApplicationNote note) {
        return new ApplicationNoteResponse(
                note.getId(),
                note.getAddedByUserId(),
                note.getContent(),
                note.getCreatedAt()
        );
    }
}
