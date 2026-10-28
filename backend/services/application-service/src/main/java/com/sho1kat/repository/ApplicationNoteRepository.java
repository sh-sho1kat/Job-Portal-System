package com.sho1kat.repository;

import com.sho1kat.entity.ApplicationNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationNoteRepository extends JpaRepository<ApplicationNote, Long> {

    List<ApplicationNote> findByApplicationIdOrderByCreatedAtAscIdAsc(Long applicationId);

    Optional<ApplicationNote> findByIdAndApplicationId(Long id, Long applicationId);
}
