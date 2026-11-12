package com.gathercart.repository;

import com.gathercart.entity.GroupPurchase;
import com.gathercart.entity.GroupPurchaseStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupPurchaseRepository extends JpaRepository<GroupPurchase, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT gp FROM GroupPurchase gp WHERE gp.id = :id")
    Optional<GroupPurchase> findByIdWithLock(@Param("id") Long id);

    Optional<GroupPurchase> findByBatchCode(String batchCode);

    List<GroupPurchase> findByProductIdAndStatus(Long productId, GroupPurchaseStatus status);

    @Query("SELECT gp FROM GroupPurchase gp WHERE gp.product.id = :productId AND gp.status = 'OPEN' ORDER BY gp.createdAt DESC")
    List<GroupPurchase> findActiveByProductId(@Param("productId") Long productId);

    Page<GroupPurchase> findByStatus(GroupPurchaseStatus status, Pageable pageable);
}
