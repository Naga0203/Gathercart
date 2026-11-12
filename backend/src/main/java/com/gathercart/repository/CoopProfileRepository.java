package com.gathercart.repository;

import com.gathercart.entity.CoopProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CoopProfileRepository extends JpaRepository<CoopProfile, Long> {

    Optional<CoopProfile> findByCoopIdCode(String coopIdCode);

    boolean existsByCoopIdCode(String coopIdCode);
}

