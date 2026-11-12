package com.gathercart.repository;

import com.gathercart.entity.GroupParticipant;
import com.gathercart.entity.GroupParticipantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupParticipantRepository extends JpaRepository<GroupParticipant, Long> {

    List<GroupParticipant> findByGroupPurchaseIdAndStatusOrderByPledgedAtDesc(Long groupPurchaseId, GroupParticipantStatus status);

    Optional<GroupParticipant> findByGroupPurchaseIdAndUserIdAndStatus(Long groupPurchaseId, Long userId, GroupParticipantStatus status);

    Optional<GroupParticipant> findByGroupPurchaseIdAndPhoneAndStatus(Long groupPurchaseId, String phone, GroupParticipantStatus status);

    @Query("SELECT COALESCE(SUM(gp.quantity), 0) FROM GroupParticipant gp WHERE gp.groupPurchase.id = :groupPurchaseId AND gp.phone = :phone AND gp.status IN ('ACTIVE', 'PAYMENT_PENDING', 'PAID')")
    Integer sumQuantityByGroupPurchaseIdAndPhone(@Param("groupPurchaseId") Long groupPurchaseId, @Param("phone") String phone);

    Optional<GroupParticipant> findByCommitmentCode(String commitmentCode);
}
