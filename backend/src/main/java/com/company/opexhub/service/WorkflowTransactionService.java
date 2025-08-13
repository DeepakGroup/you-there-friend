package com.company.opexhub.service;

import com.company.opexhub.entity.Initiative;
import com.company.opexhub.entity.User;
import com.company.opexhub.entity.WorkflowTransaction;
import com.company.opexhub.repository.InitiativeRepository;
import com.company.opexhub.repository.UserRepository;
import com.company.opexhub.repository.WorkflowTransactionRepository;
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
        String[] stageNames = {
            "Register Initiative",                    // Step 1
            "Approval",                              // Step 2
            "Define Responsibilities",               // Step 3
            "MOC Stage",                            // Step 4
            "CAPEX Stage",                          // Step 5
            "Initiative Timeline Tracker",          // Step 6
            "Trial Implementation & Performance Check", // Step 7
            "Periodic Status Review with CMO",      // Step 8
            "Savings Monitoring (1 Month)",         // Step 9
            "Saving Validation with F&A",          // Step 10
            "Initiative Closure"                    // Step 11
        };

        String[] roleCodes = {
            "STLD",    // Site TSD Lead
            "SH",      // Site Head
            "EH",      // Engineering Head
            "IL",      // Initiative Lead
            "IL",      // Initiative Lead
            "IL",      // Initiative Lead
            "STLD",    // Site TSD Lead
            "CTSD",    // Corp TSD
            "STLD",    // Site TSD Lead
            "STLD",    // Site TSD Lead
            "STLD"     // Site TSD Lead
        };

        for (int i = 0; i < stageNames.length; i++) {
            WorkflowTransaction transaction = new WorkflowTransaction(
                initiative.getId(),
                i + 1,
                stageNames[i],
                initiative.getSite(),
                roleCodes[i],
                roleCodes[i]
            );

            if (i == 0) {
                // First stage is auto-approved
                transaction.setApproveStatus("approved");
                transaction.setActionBy(initiative.getCreatedBy().getFullName());
                transaction.setActionDate(LocalDateTime.now());
                transaction.setComment("Initiative created and registered");
                transaction.setPendingWith(null);
            }

            workflowTransactionRepository.save(transaction);
        }
    }

    @Transactional
    public WorkflowTransaction processStageAction(Long transactionId, String action, String comment, 
                                                String actionBy, Long assignedUserId, 
                                                String mocNumber, String capexNumber,
                                                Boolean requiresMoc, Boolean requiresCapex) {
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
        if (mocNumber != null) {
            transaction.setMocNumber(mocNumber);
        }
        if (capexNumber != null) {
            transaction.setCapexNumber(capexNumber);
        }
        if (requiresMoc != null) {
            transaction.setRequiresMoc(requiresMoc);
        }
        if (requiresCapex != null) {
            transaction.setRequiresCapex(requiresCapex);
        }

        WorkflowTransaction savedTransaction = workflowTransactionRepository.save(transaction);

        // Update initiative status and move to next stage if approved
        Initiative initiative = initiativeRepository.findById(transaction.getInitiativeId())
                .orElseThrow(() -> new RuntimeException("Initiative not found"));

        if ("approved".equals(action)) {
            // Move to next stage
            Optional<WorkflowTransaction> nextStage = workflowTransactionRepository
                    .findByInitiativeIdAndStageNumber(initiative.getId(), transaction.getStageNumber() + 1);
            
            if (nextStage.isPresent()) {
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