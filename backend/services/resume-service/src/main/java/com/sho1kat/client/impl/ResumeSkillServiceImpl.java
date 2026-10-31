package com.sho1kat.client.impl;

import com.sho1kat.dto.ResumeServiceDto.request.ResumeSkillRequest;
import com.sho1kat.dto.ResumeServiceDto.response.ResumeSkillResponse;
import com.sho1kat.entity.Resume;
import com.sho1kat.entity.ResumeSkill;
import com.sho1kat.exception.ApiException;
import com.sho1kat.mapper.ResumeSkillMapper;
import com.sho1kat.repository.ResumeSkillRepository;
import com.sho1kat.client.ResumeService;
import com.sho1kat.client.ResumeSkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResumeSkillServiceImpl implements ResumeSkillService {

    private final ResumeService resumeService;
    private final ResumeSkillRepository resumeSkillRepository;
    private final ResumeSkillMapper resumeSkillMapper;

    @Override
    @Transactional
    public ResumeSkillResponse addSkill(Long resumeId, Long candidateId, ResumeSkillRequest request) {
        Resume resume = resumeService.requireOwnedResume(resumeId, candidateId);
        requireUniqueName(resume.getId(), request.skillName(), null);
        ResumeSkill skill = resumeSkillRepository.save(resumeSkillMapper.toEntity(resume, request));
        resumeService.refreshCompletionScore(resume);
        return resumeSkillMapper.toResponse(skill);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResumeSkillResponse> getSkills(Long resumeId, Long candidateId) {
        Resume resume = resumeService.requireOwnedResume(resumeId, candidateId);
        return resumeSkillRepository.findByResumeIdOrderByDisplayOrderAscIdAsc(resume.getId())
                .stream()
                .map(resumeSkillMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ResumeSkillResponse updateSkill(Long skillId, Long resumeId, Long candidateId,
                                           ResumeSkillRequest request) {
        Resume resume = resumeService.requireOwnedResume(resumeId, candidateId);
        ResumeSkill skill = requireSkill(skillId, resume.getId());
        requireUniqueName(resume.getId(), request.skillName(), skill.getId());
        resumeSkillMapper.updateEntity(request, skill);
        ResumeSkill saved = resumeSkillRepository.save(skill);
        resumeService.refreshCompletionScore(resume);
        return resumeSkillMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteSkill(Long skillId, Long resumeId, Long candidateId) {
        Resume resume = resumeService.requireOwnedResume(resumeId, candidateId);
        ResumeSkill skill = requireSkill(skillId, resume.getId());
        resumeSkillRepository.delete(skill);
        resumeService.refreshCompletionScore(resume);
    }

    // ---- helpers ----

    private ResumeSkill requireSkill(Long skillId, Long resumeId) {
        return resumeSkillRepository.findByIdAndResumeId(skillId, resumeId)
                .orElseThrow(() -> ApiException.notFound("Resume skill not found with id: " + skillId));
    }

    /** One entry per skill name (case-insensitive); {@code excludeId} keeps renames to themselves. */
    private void requireUniqueName(Long resumeId, String skillName, Long excludeId) {
        if (resumeSkillRepository.existsByResumeIdAndSkillNameIgnoreCaseAndIdNot(
                resumeId, skillName.trim(), excludeId == null ? 0L : excludeId)) {
            throw ApiException.conflict("Skill '" + skillName.trim() + "' is already on this resume");
        }
    }
}
