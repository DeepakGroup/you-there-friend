package com.company.opexhub.service;

import com.company.opexhub.entity.Initiative;
import com.company.opexhub.entity.User;
import com.company.opexhub.entity.WorkflowStage;
import com.company.opexhub.repository.InitiativeRepository;
import com.company.opexhub.repository.UserRepository;
import com.company.opexhub.repository.WorkflowStageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WorkflowService {

    @Autowired
    private WorkflowStageRepository workflowStageRepository;

    @Autowired
    private InitiativeRepository initiativeRepository;

    @Autowired
    private UserRepository userRepository;

    public List<WorkflowStage> getWorkflowStages(Long initiativeId) {
        return workflowStageRepository.findByInitiativeIdOrderByStageNumber(initiativeId);
    }

    @Transactional
    public WorkflowStage approveStage(Long stageId, String approverName, String comments) {
        WorkflowStage stage = workflowStageRepository.findById(stageId)
                .orElseThrow(() -> new RuntimeException("Workflow stage not found"));

        if (!"pending".equals(stage.getStatus())) {
            throw new RuntimeException("Stage is not pending approval");
        }

        stage.setStatus("approved");
        stage.setApprovedBy(approverName);
        stage.setApprovedAt(LocalDateTime.now());
        stage.setComments(comments);

        WorkflowStage savedStage = workflowStageRepository.save(stage);

        // Update initiative current stage
        Initiative initiative = stage.getInitiative();
        initiative.setCurrentStage(stage.getStageNumber() + 1);
        
        // Check if this is the last stage
        List<WorkflowStage> allStages = workflowStageRepository.findByInitiativeIdOrderByStageNumber(initiative.getId());
        if (stage.getStageNumber().equals(allStages.size())) {
            initiative.setStatus("Completed");
        } else {
            initiative.setStatus("In Progress");
        }
        
        initiativeRepository.save(initiative);

        return savedStage;
    }

    @Transactional
    public WorkflowStage rejectStage(Long stageId, String rejectorName, String comments) {
        WorkflowStage stage = workflowStageRepository.findById(stageId)
                .orElseThrow(() -> new RuntimeException("Workflow stage not found"));

        if (!"pending".equals(stage.getStatus())) {
            throw new RuntimeException("Stage is not pending approval");
        }

        stage.setStatus("rejected");
        stage.setApprovedBy(rejectorName);
        stage.setApprovedAt(LocalDateTime.now());
        stage.setComments(comments);

        WorkflowStage savedStage = workflowStageRepository.save(stage);

        // Update initiative status to rejected
        Initiative initiative = stage.getInitiative();
        initiative.setStatus("Rejected");
        initiativeRepository.save(initiative);

        return savedStage;
    }

    public List<WorkflowStage> getPendingApprovals(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return workflowStageRepository.findPendingStagesByRole(user.getRole());
    }

    public List<WorkflowStage> getPendingStagesByRole(String role) {
        return workflowStageRepository.findPendingStagesByRole(role);
    }
}