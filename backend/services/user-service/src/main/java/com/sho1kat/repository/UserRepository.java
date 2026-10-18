package com.sho1kat.repository;

import com.sho1kat.entity.User;
import com.sho1kat.enums.UserRole;
import com.sho1kat.enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    Page<User> findByStatusNot(UserStatus status, Pageable pageable);

    Page<User> findByUserRoleAndStatusNot(UserRole userRole, UserStatus status, Pageable pageable);
}