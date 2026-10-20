package com.sho1kat.repository;

import com.sho1kat.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long>, JpaSpecificationExecutor<Company> {

    Optional<Company> findBySlug(String slug);

    Optional<Company> findByOwnerId(Long ownerId);

    boolean existsBySlug(String slug);

    boolean existsByOwnerId(Long ownerId);

    boolean existsByRegistrationNumber(String registrationNumber);
}