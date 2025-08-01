package com.company.opexhub.repository;

import com.company.opexhub.entity.WorkflowStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowStageRepository extends JpaRepository<WorkflowStage, Long> {
    
    List<WorkflowStage> findByInitiative_Id(Long initiativeId);
    
    List<WorkflowStage> findByStatus(String status);
    
    List<WorkflowStage> findByRequiredRole(String requiredRole);
    
    @Query("SELECT w FROM WorkflowStage w WHERE w.initiative.id = :initiativeId ORDER BY w.stageNumber")
    List<WorkflowStage> findByInitiativeIdOrderByStageNumber(@Param("initiativeId") Long initiativeId);
    
    @Query("SELECT w FROM WorkflowStage w WHERE w.initiative.id = :initiativeId AND w.stageNumber = :stageNumber")
    Optional<WorkflowStage> findByInitiativeIdAndStageNumber(@Param("initiativeId") Long initiativeId, 
                                                           @Param("stageNumber") Integer stageNumber);
    
    @Query("SELECT w FROM WorkflowStage w WHERE w.status = 'pending' AND w.requiredRole = :role")
    List<WorkflowStage> findPendingStagesByRole(@Param("role") String role);
}