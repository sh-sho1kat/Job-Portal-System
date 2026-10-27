package com.sho1kat.service;

import com.sho1kat.dto.ResumeServiceDto.request.LanguageProficiencyRequest;
import com.sho1kat.dto.ResumeServiceDto.response.LanguageProficiencyResponse;

import java.util.List;

public interface LanguageService {

    LanguageProficiencyResponse addLanguage(Long resumeId, Long candidateId, LanguageProficiencyRequest request);

    List<LanguageProficiencyResponse> getLanguages(Long resumeId, Long candidateId);

    LanguageProficiencyResponse updateLanguage(Long languageId, Long resumeId, Long candidateId,
                                                LanguageProficiencyRequest request);

    void deleteLanguage(Long languageId, Long resumeId, Long candidateId);
}
