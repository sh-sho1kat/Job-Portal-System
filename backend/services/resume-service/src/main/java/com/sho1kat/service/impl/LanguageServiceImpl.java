package com.sho1kat.service.impl;

import com.sho1kat.dto.ResumeServiceDto.request.LanguageProficiencyRequest;
import com.sho1kat.dto.ResumeServiceDto.response.LanguageProficiencyResponse;
import com.sho1kat.entity.Language;
import com.sho1kat.entity.Resume;
import com.sho1kat.exception.ApiException;
import com.sho1kat.mapper.LanguageMapper;
import com.sho1kat.repository.LanguageRepository;
import com.sho1kat.service.LanguageService;
import com.sho1kat.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LanguageServiceImpl implements LanguageService {

    private final ResumeService resumeService;
    private final LanguageRepository languageRepository;
    private final LanguageMapper languageMapper;

    @Override
    @Transactional
    public LanguageProficiencyResponse addLanguage(Long resumeId, Long candidateId,
                                                   LanguageProficiencyRequest request) {
        Resume resume = resumeService.requireOwnedResume(resumeId, candidateId);
        requireUniqueName(resume.getId(), request.languageName(), null);
        Language language = languageRepository.save(languageMapper.toEntity(resume, request));
        resumeService.refreshCompletionScore(resume);
        return languageMapper.toResponse(language);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LanguageProficiencyResponse> getLanguages(Long resumeId, Long candidateId) {
        Resume resume = resumeService.requireOwnedResume(resumeId, candidateId);
        return languageRepository.findByResumeIdOrderByDisplayOrderAscIdAsc(resume.getId())
                .stream()
                .map(languageMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public LanguageProficiencyResponse updateLanguage(Long languageId, Long resumeId, Long candidateId,
                                                      LanguageProficiencyRequest request) {
        Resume resume = resumeService.requireOwnedResume(resumeId, candidateId);
        Language language = requireLanguage(languageId, resume.getId());
        requireUniqueName(resume.getId(), request.languageName(), language.getId());
        languageMapper.updateEntity(request, language);
        Language saved = languageRepository.save(language);
        resumeService.refreshCompletionScore(resume);
        return languageMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteLanguage(Long languageId, Long resumeId, Long candidateId) {
        Resume resume = resumeService.requireOwnedResume(resumeId, candidateId);
        Language language = requireLanguage(languageId, resume.getId());
        languageRepository.delete(language);
        resumeService.refreshCompletionScore(resume);
    }

    // ---- helpers ----

    private Language requireLanguage(Long languageId, Long resumeId) {
        return languageRepository.findByIdAndResumeId(languageId, resumeId)
                .orElseThrow(() -> ApiException.notFound("Language not found with id: " + languageId));
    }

    /** One entry per language name (case-insensitive). */
    private void requireUniqueName(Long resumeId, String languageName, Long excludeId) {
        if (languageRepository.existsByResumeIdAndLanguageNameIgnoreCaseAndIdNot(
                resumeId, languageName.trim(), excludeId == null ? 0L : excludeId)) {
            throw ApiException.conflict("Language '" + languageName.trim() + "' is already on this resume");
        }
    }
}
