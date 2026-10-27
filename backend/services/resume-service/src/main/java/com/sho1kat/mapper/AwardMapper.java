package com.sho1kat.mapper;

import com.sho1kat.dto.ResumeServiceDto.request.AwardRequest;
import com.sho1kat.dto.ResumeServiceDto.response.AwardResponse;
import com.sho1kat.entity.Award;
import com.sho1kat.entity.Resume;
import org.springframework.stereotype.Component;

@Component
public class AwardMapper {

    public Award toEntity(Resume resume, AwardRequest request) {
        return Award.builder()
                .resume(resume)
                .title(request.title().trim())
                .issuer(trim(request.issuer()))
                .dateAwarded(request.dateAwarded())
                .description(request.description())
                .displayOrder(request.displayOrder() == null ? 0 : request.displayOrder())
                .build();
    }

    public void updateEntity(AwardRequest request, Award award) {
        award.setTitle(request.title().trim());
        award.setIssuer(trim(request.issuer()));
        award.setDateAwarded(request.dateAwarded());
        award.setDescription(request.description());
        award.setDisplayOrder(request.displayOrder() == null ? 0 : request.displayOrder());
    }

    public AwardResponse toResponse(Award award) {
        return new AwardResponse(
                award.getId(),
                award.getTitle(),
                award.getIssuer(),
                award.getDateAwarded(),
                award.getDescription(),
                award.getDisplayOrder(),
                award.getCreatedAt(),
                award.getUpdatedAt()
        );
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }
}
