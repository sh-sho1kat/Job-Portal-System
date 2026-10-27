package com.sho1kat.mapper;

import com.sho1kat.dto.ResumeServiceDto.request.LanguageProficiencyRequest;
import com.sho1kat.dto.ResumeServiceDto.response.LanguageProficiencyResponse;
import com.sho1kat.entity.Language;
import com.sho1kat.entity.Resume;
import org.springframework.stereotype.Component;

@Component
public class LanguageMapper {

    public Language toEntity(Resume resume, LanguageProficiencyRequest request) {
        return Language.builder()
                .resume(resume)
                .languageName(request.languageName().trim())
                .proficiency(request.proficiency())
                .displayOrder(request.displayOrder() == null ? 0 : request.displayOrder())
                .build();
    }

    public void updateEntity(LanguageProficiencyRequest request, Language language) {
        language.setLanguageName(request.languageName().trim());
        language.setProficiency(request.proficiency());
        language.setDisplayOrder(request.displayOrder() == null ? 0 : request.displayOrder());
    }

    public LanguageProficiencyResponse toResponse(Language language) {
        return new LanguageProficiencyResponse(
                language.getId(),
                language.getLanguageName(),
                language.getProficiency(),
                language.getDisplayOrder(),
                language.getCreatedAt(),
                language.getUpdatedAt()
        );
    }
}
