package com.sho1kat.repository;

import com.sho1kat.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByResumeIdOrderByDisplayOrderAscIdAsc(Long resumeId);

    Optional<Project> findByIdAndResumeId(Long id, Long resumeId);

    boolean existsByResumeId(Long resumeId);
}
