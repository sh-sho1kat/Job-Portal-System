package com.sho1kat.repository;

import com.sho1kat.entity.ResumeSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeSkillRepository extends JpaRepository<ResumeSkill, Long> {

    List<ResumeSkill> findByResumeIdOrderByDisplayOrderAscIdAsc(Long resumeId);

    Optional<ResumeSkill> findByIdAndResumeId(Long id, Long resumeId);

    boolean existsByResumeId(Long resumeId);

    boolean existsByResumeIdAndSkillNameIgnoreCaseAndIdNot(Long resumeId, String skillName, Long id);
}
