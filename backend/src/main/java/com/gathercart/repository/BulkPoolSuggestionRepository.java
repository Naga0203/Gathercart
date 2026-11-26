package com.gathercart.repository;

import com.gathercart.entity.BulkPoolSuggestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BulkPoolSuggestionRepository extends JpaRepository<BulkPoolSuggestion, Long> {

    List<BulkPoolSuggestion> findByUserIdOrderByCreatedAtDesc(Long userId);
}
