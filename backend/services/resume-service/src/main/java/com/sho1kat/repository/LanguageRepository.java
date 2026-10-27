package com.sho1kat.repository;

import com.sho1kat.entity.Language;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LanguageRepository extends JpaRepository<Language, Long> {

    List<Language> findByResumeIdOrderByDisplayOrderAscIdAsc(Long resumeId);

    Optional<Language> findByIdAndResumeId(Long id, Long resumeId);

    boolean existsByResumeId(Long resumeId);

    boolean existsByResumeIdAndLanguageNameIgnoreCaseAndIdNot(Long resumeId, String languageName, Long id);
}
