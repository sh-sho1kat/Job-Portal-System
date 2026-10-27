package com.sho1kat.dto.ResumeServiceDto.response;

import com.sho1kat.enums.ResumeTemplateType;
import com.sho1kat.enums.ResumeVisibility;
import java.time.Instant;
import java.util.List;

public record ResumeResponse(
        Long id,
        Long candidateId,
        String title,
        ResumeTemplateType template,
        ResumeVisibility visibility,
        Boolean isDefault,
        PersonalInfoResponse personalInfo,
        String summary,
        Integer completionScore,
        Instant lastViewedAt,
        Instant createdAt,
        Instant updatedAt,
        List<WorkExperienceResponse> workExperiences,
        List<EducationResponse> educations,
        List<ResumeSkillResponse> skills,
        List<ProjectResponse> projects,
        List<CertificationResponse> certifications,
        List<AwardResponse> awards,
        List<LanguageProficiencyResponse> languages
) {
}
