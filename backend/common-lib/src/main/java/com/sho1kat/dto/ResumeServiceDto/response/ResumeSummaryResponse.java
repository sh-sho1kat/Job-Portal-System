package com.sho1kat.dto.ResumeServiceDto.response;

import com.sho1kat.enums.ResumeTemplateType;
import com.sho1kat.enums.ResumeVisibility;

import java.time.Instant;
import java.util.List;

public record ResumeSummaryResponse(
        Long id,
        Long candidateId,
        String title,
        PersonalInfoResponse personalInfo,
        String summary,
        List<WorkExperienceResponse> workExperiences,
        List<EducationResponse> educations,
        List<ResumeSkillResponse> skills,
        List<ProjectResponse> projects,
        List<CertificationResponse> certifications,
        List<AwardResponse> awards,
        List<LanguageProficiencyResponse> languages
) {
}
