package com.sho1kat.repository;

import com.sho1kat.entity.CompanyLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyLocationRepository extends JpaRepository<CompanyLocation, Long> {

    List<CompanyLocation> findAllByCompanyIdOrderByIdAsc(Long companyId);
}
