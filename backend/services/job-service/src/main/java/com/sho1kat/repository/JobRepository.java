package com.sho1kat.repository;

import com.sho1kat.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {

    boolean existsBySlug(String slug);

    Page<Job> findByPostedByOwnerIdAndDeletedAtIsNull(Long postedByOwnerId, Pageable pageable);

    List<Job> findByCompanyIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long companyId);

    @Query("select count(j) > 0 from Job j where j.category.id = :categoryId and j.deletedAt is null")
    boolean existsActiveJobForCategory(@Param("categoryId") Long categoryId);

    @Query("select count(j) > 0 from Job j join j.skills s where s.id = :skillId and j.deletedAt is null")
    boolean existsActiveJobForSkill(@Param("skillId") Long skillId);

    @Query("select count(j) > 0 from Job j join j.tags t where t.id = :tagId and j.deletedAt is null")
    boolean existsActiveJobForTag(@Param("tagId") Long tagId);

    boolean existsByIdAndDeletedAtIsNull(Long id);

    /** Atomic view bump; no-op for soft-deleted postings. */
    @Modifying
    @Query("update Job j set j.viewCount = j.viewCount + 1 where j.id = :id and j.deletedAt is null")
    int incrementViewCount(@Param("id") Long id);

    @Modifying
    @Query("update Job j set j.applicationCount = j.applicationCount + 1 where j.id = :id")
    int incrementApplicationCount(@Param("id") Long id);
}
