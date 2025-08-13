package com.company.opexhub.service;

import com.company.opexhub.entity.Initiative;
import com.company.opexhub.entity.User;
import com.company.opexhub.entity.WorkflowTransaction;
import com.company.opexhub.entity.WfMaster;
import com.company.opexhub.repository.InitiativeRepository;
import com.company.opexhub.repository.UserRepository;
import com.company.opexhub.repository.WorkflowTransactionRepository;
import com.company.opexhub.repository.WfMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class WorkflowTransactionService {

    @Autowired
    private WorkflowTransactionRepository workflowTransactionRepository;

    @Autowired
    private InitiativeRepository initiativeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WfMasterRepository wfMasterRepository;

    public List<WorkflowTransaction> getWorkflowTransactions(Long initiativeId) {
        return workflowTransactionRepository.findByInitiativeIdOrderByStageNumber(initiativeId);
    }

    public List<WorkflowTransaction> getPendingTransactionsByRole(String roleCode) {
        return workflowTransactionRepository.findPendingTransactionsByRole(roleCode);
    }

    public List<WorkflowTransaction> getPendingTransactionsBySiteAndRole(String site, String roleCode) {
        return workflowTransactionRepository.findPendingTransactionsBySiteAndRole(site, roleCode);
    }

    @Transactional
    public void createInitialWorkflowTransactions(Initiative initiative) {
        // Get workflow configuration from wf_master table
        List<WfMaster> workflowStages = wfMasterRepository.findBySiteAndIsActiveOrderByStageNumber(
            initiative.getSite(), true);

        if (workflowStages.isEmpty()) {
            throw new RuntimeException("No workflow configuration found for site: " + initiative.getSite());
        }

        for (WfMaster wfStage : workflowStages) {
            WorkflowTransaction transaction = new WorkflowTransaction(
                initiative.getId(),
                wfStage.getStageNumber(),
                wfStage.getStageName(),
                initiative.getSite(),
                wfStage.getRoleCode(),
                wfStage.getUserEmail()
            );

            if (wfStage.getStageNumber() == 1) {
                // First stage is auto-approved
                transaction.setApproveStatus("approved");
                transaction.setActionBy(initiative.getCreatedBy().getFullName());
                transaction.setActionDate(LocalDateTime.now());
                transaction.setComment("Initiative created and registered");
                transaction.setPendingWith(null);
            } else {
                // Set pending with the user email from wf_master
                transaction.setPendingWith(wfStage.getUserEmail());
            }

            workflowTransactionRepository.save(transaction);
        }
    }

    @Transactional
    public WorkflowTransaction processStageAction(Long transactionId, String action, String comment, 
                                                String actionBy, Long assignedUserId) {
        WorkflowTransaction transaction = workflowTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Workflow transaction not found"));

        if (!"pending".equals(transaction.getApproveStatus())) {
            throw new RuntimeException("Transaction is not pending");
        }

        transaction.setApproveStatus(action); // "approved" or "rejected"
        transaction.setActionBy(actionBy);
        transaction.setActionDate(LocalDateTime.now());
        transaction.setComment(comment);
        transaction.setPendingWith(null);

        // Store additional data based on stage
        if (assignedUserId != null) {
            transaction.setAssignedUserId(assignedUserId);
        }

        WorkflowTransaction savedTransaction = workflowTransactionRepository.save(transaction);

        // Update initiative status and move to next stage if approved
        Initiative initiative = initiativeRepository.findById(transaction.getInitiativeId())
                .orElseThrow(() -> new RuntimeException("Initiative not found"));

        if ("approved".equals(action)) {
            // Special handling for Stage 3 - Update IL for stages 4, 5, 6
            if (transaction.getStageNumber() == 3 && assignedUserId != null) {
                updateILForStages456(initiative.getId(), assignedUserId);
            }
            
            // Move to next stage
            Optional<WorkflowTransaction> nextStage = workflowTransactionRepository
                    .findByInitiativeIdAndStageNumber(initiative.getId(), transaction.getStageNumber() + 1);
            
            if (nextStage.isPresent()) {
                // Activate next stage
                WorkflowTransaction nextTransaction = nextStage.get();
                nextTransaction.setApproveStatus("pending");
                workflowTransactionRepository.save(nextTransaction);
                
                initiative.setCurrentStage(transaction.getStageNumber() + 1);
                initiative.setStatus("In Progress");
            } else {
                // All stages completed
                initiative.setStatus("Completed");
            }
        } else {
            // Rejected
            initiative.setStatus("Rejected");
        }

        initiativeRepository.save(initiative);
        return savedTransaction;
    }

    @Transactional
    private void updateILForStages456(Long initiativeId, Long assignedUserId) {
        // Get the assigned user
        User assignedUser = userRepository.findById(assignedUserId)
                .orElseThrow(() -> new RuntimeException("Assigned user not found"));

        // Update stages 4, 5, 6 with the selected IL
        for (int stageNumber = 4; stageNumber <= 6; stageNumber++) {
            Optional<WorkflowTransaction> stageTransaction = workflowTransactionRepository
                    .findByInitiativeIdAndStageNumber(initiativeId, stageNumber);
            
            if (stageTransaction.isPresent()) {
                WorkflowTransaction transaction = stageTransaction.get();
                transaction.setPendingWith(assignedUser.getEmail());
                transaction.setAssignedUserId(assignedUserId);
                workflowTransactionRepository.save(transaction);
            }
        }
    }

    public Optional<WorkflowTransaction> getCurrentPendingStage(Long initiativeId) {
        return workflowTransactionRepository.findCurrentPendingStage(initiativeId);
    }

    public Integer getProgressPercentage(Long initiativeId) {
        Integer approvedStages = workflowTransactionRepository.countApprovedStages(initiativeId);
        Integer totalStages = workflowTransactionRepository.countTotalStages(initiativeId);
        
        if (totalStages == 0) return 0;
        return (approvedStages * 100) / totalStages;
    }
}