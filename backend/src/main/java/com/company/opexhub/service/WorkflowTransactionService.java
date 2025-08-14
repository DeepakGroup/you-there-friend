package com.company.opexhub.service;

import com.company.opexhub.entity.Initiative;
import com.company.opexhub.entity.User;
import com.company.opexhub.entity.WorkflowTransaction;
import com.company.opexhub.entity.WfMaster;
import com.company.opexhub.dto.WorkflowTransactionDetailDTO;
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
import java.util.stream.Collectors;

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
    
    public List<WorkflowTransactionDetailDTO> getVisibleWorkflowTransactions(Long initiativeId) {
        List<WorkflowTransaction> allTransactions = workflowTransactionRepository
                .findByInitiativeIdOrderByStageNumber(initiativeId);
        
        return allTransactions.stream()
                .map(this::convertToDetailDTO)
                .filter(WorkflowTransactionDetailDTO::getIsVisible)
                .collect(Collectors.toList());
    }
    
    private WorkflowTransactionDetailDTO convertToDetailDTO(WorkflowTransaction transaction) {
        WorkflowTransactionDetailDTO dto = new WorkflowTransactionDetailDTO();
        dto.setId(transaction.getId());
        dto.setInitiativeId(transaction.getInitiativeId());
        dto.setStageNumber(transaction.getStageNumber());
        dto.setStageName(transaction.getStageName());
        dto.setSite(transaction.getSite());
        dto.setApproveStatus(transaction.getApproveStatus());
        dto.setComment(transaction.getComment());
        dto.setActionBy(transaction.getActionBy());
        dto.setActionDate(transaction.getActionDate());
        dto.setPendingWith(transaction.getPendingWith());
        dto.setRequiredRole(transaction.getRequiredRole());
        dto.setAssignedUserId(transaction.getAssignedUserId());
        dto.setCreatedAt(transaction.getCreatedAt());
        dto.setUpdatedAt(transaction.getUpdatedAt());
        
        // Get assigned user name if available
        if (transaction.getAssignedUserId() != null) {
            Optional<User> assignedUser = userRepository.findById(transaction.getAssignedUserId());
            if (assignedUser.isPresent()) {
                dto.setAssignedUserName(assignedUser.get().getFullName());
            }
        }
        
        // Set next stage information
        setNextStageInfo(dto, transaction);
        
        // Determine visibility based on workflow progression
        dto.setIsVisible(isStageVisible(transaction));
        
        return dto;
    }
    
    private void setNextStageInfo(WorkflowTransactionDetailDTO dto, WorkflowTransaction transaction) {
        Optional<WfMaster> nextStageConfig = wfMasterRepository
                .findBySiteAndStageNumberAndIsActive(transaction.getSite(), 
                    transaction.getStageNumber() + 1, true);
                    
        if (nextStageConfig.isPresent()) {
            WfMaster nextStage = nextStageConfig.get();
            dto.setNextStageName(nextStage.getStageName());
            dto.setNextUserEmail(nextStage.getUserEmail());
            
            // Get next user name
            Optional<User> nextUser = userRepository.findByEmail(nextStage.getUserEmail());
            if (nextUser.isPresent()) {
                dto.setNextUser(nextUser.get().getFullName());
            }
        }
    }
    
    private boolean isStageVisible(WorkflowTransaction transaction) {
        // Stage 1 is always visible (auto-approved)
        if (transaction.getStageNumber() == 1) {
            return true;
        }
        
        // Check if previous stage is approved
        Optional<WorkflowTransaction> previousStage = workflowTransactionRepository
                .findByInitiativeIdAndStageNumber(transaction.getInitiativeId(), 
                    transaction.getStageNumber() - 1);
                    
        if (previousStage.isPresent()) {
            String previousStatus = previousStage.get().getApproveStatus();
            // Current stage is visible if previous stage is approved or if current stage is pending/approved
            return "approved".equals(previousStatus) || 
                   "pending".equals(transaction.getApproveStatus()) || 
                   "approved".equals(transaction.getApproveStatus());
        }
        
        return false;
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

        // Only create workflow transactions for the first 3 stages initially
        // Stages 4-11 will be created dynamically as the workflow progresses
        for (WfMaster wfStage : workflowStages) {
            if (wfStage.getStageNumber() <= 3) {
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
                    
                    // Create next stage (Stage 2) as pending
                    createNextStage(initiative.getId(), 2);
                } else if (wfStage.getStageNumber() == 2) {
                    // Stage 2 is pending after Stage 1 approval
                    transaction.setApproveStatus("pending");
                    transaction.setPendingWith(wfStage.getUserEmail());
                } else {
                    // Stage 3 is not started yet
                    transaction.setApproveStatus("not_started");
                    transaction.setPendingWith(null);
                }

                workflowTransactionRepository.save(transaction);
            }
        }
    }
    
    @Transactional
    private void createNextStage(Long initiativeId, Integer stageNumber) {
        // Get the workflow configuration for the next stage
        Initiative initiative = initiativeRepository.findById(initiativeId)
                .orElseThrow(() -> new RuntimeException("Initiative not found"));
                
        Optional<WfMaster> nextStageConfig = wfMasterRepository
                .findBySiteAndStageNumberAndIsActive(initiative.getSite(), stageNumber, true);
                
        if (nextStageConfig.isPresent()) {
            WfMaster wfStage = nextStageConfig.get();
            
            // Check if transaction already exists
            Optional<WorkflowTransaction> existingTransaction = workflowTransactionRepository
                    .findByInitiativeIdAndStageNumber(initiativeId, stageNumber);
                    
            if (!existingTransaction.isPresent()) {
                WorkflowTransaction transaction = new WorkflowTransaction(
                    initiativeId,
                    wfStage.getStageNumber(),
                    wfStage.getStageName(),
                    initiative.getSite(),
                    wfStage.getRoleCode(),
                    wfStage.getUserEmail()
                );
                
                transaction.setApproveStatus("pending");
                transaction.setPendingWith(wfStage.getUserEmail());
                workflowTransactionRepository.save(transaction);
            }
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
            Integer currentStageNumber = transaction.getStageNumber();
            
            // Special handling for Stage 3 - Create and assign IL for stages 4, 5, 6
            if (currentStageNumber == 3 && assignedUserId != null) {
                createStagesWithAssignedIL(initiative.getId(), assignedUserId);
            } else {
                // For other stages, create next stage dynamically
                createNextStage(initiative.getId(), currentStageNumber + 1);
            }
            
            // Update initiative current stage
            initiative.setCurrentStage(currentStageNumber + 1);
            
            // Check if this is the last stage
            Integer totalStages = wfMasterRepository.findBySiteAndIsActiveOrderByStageNumber(
                initiative.getSite(), true).size();
            
            if (currentStageNumber >= totalStages) {
                initiative.setStatus("Completed");
            } else {
                initiative.setStatus("In Progress");
            }
        } else {
            // Rejected
            initiative.setStatus("Rejected");
        }

        initiativeRepository.save(initiative);
        return savedTransaction;
    }

    @Transactional
    private void createStagesWithAssignedIL(Long initiativeId, Long assignedUserId) {
        // Get the assigned user
        User assignedUser = userRepository.findById(assignedUserId)
                .orElseThrow(() -> new RuntimeException("Assigned user not found"));
                
        Initiative initiative = initiativeRepository.findById(initiativeId)
                .orElseThrow(() -> new RuntimeException("Initiative not found"));

        // Create stages 4, 5, 6 with the selected IL
        for (int stageNumber = 4; stageNumber <= 6; stageNumber++) {
            Optional<WfMaster> stageConfig = wfMasterRepository
                    .findBySiteAndStageNumberAndIsActive(initiative.getSite(), stageNumber, true);
                    
            if (stageConfig.isPresent()) {
                WfMaster wfStage = stageConfig.get();
                
                // Check if transaction already exists
                Optional<WorkflowTransaction> existingTransaction = workflowTransactionRepository
                        .findByInitiativeIdAndStageNumber(initiativeId, stageNumber);
                        
                if (!existingTransaction.isPresent()) {
                    WorkflowTransaction transaction = new WorkflowTransaction(
                        initiativeId,
                        wfStage.getStageNumber(),
                        wfStage.getStageName(),
                        initiative.getSite(),
                        wfStage.getRoleCode(),
                        assignedUser.getEmail()  // Use assigned IL's email
                    );
                    
                    if (stageNumber == 4) {
                        // Stage 4 is pending after Stage 3 approval
                        transaction.setApproveStatus("pending");
                        transaction.setPendingWith(assignedUser.getEmail());
                    } else {
                        // Stages 5, 6 are not started yet
                        transaction.setApproveStatus("not_started");
                        transaction.setPendingWith(null);
                    }
                    
                    transaction.setAssignedUserId(assignedUserId);
                    workflowTransactionRepository.save(transaction);
                }
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