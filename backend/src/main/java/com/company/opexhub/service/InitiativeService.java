package com.company.opexhub.service;

import com.company.opexhub.dto.InitiativeRequest;
import com.company.opexhub.entity.Initiative;
import com.company.opexhub.entity.User;
import com.company.opexhub.entity.WorkflowStage;
import com.company.opexhub.repository.InitiativeRepository;
import com.company.opexhub.repository.UserRepository;
import com.company.opexhub.repository.WorkflowStageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class InitiativeService {

    @Autowired
    private InitiativeRepository initiativeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkflowStageRepository workflowStageRepository;

    @Autowired
    private WorkflowTransactionService workflowTransactionService;

    public Page<Initiative> getAllInitiatives(Pageable pageable) {
        return initiativeRepository.findAll(pageable);
    }

    public Page<Initiative> getInitiativesByStatus(String status, Pageable pageable) {
        return initiativeRepository.findByStatus(status, pageable);
    }

    public Page<Initiative> getInitiativesBySite(String site, Pageable pageable) {
        return initiativeRepository.findBySite(site, pageable);
    }

    public Page<Initiative> searchInitiatives(String status, String site, String title, Pageable pageable) {
        if (status != null && site != null && title != null) {
            return initiativeRepository.findByStatusAndSiteAndTitleContaining(status, site, title, pageable);
        } else if (title != null) {
            return initiativeRepository.findByTitleContaining(title, pageable);
        } else if (status != null && site != null) {
            return initiativeRepository.findByStatusAndSite(status, site, pageable);
        } else if (status != null) {
            return initiativeRepository.findByStatus(status, pageable);
        } else if (site != null) {
            return initiativeRepository.findBySite(site, pageable);
        } else {
            return initiativeRepository.findAll(pageable);
        }
    }

    public Optional<Initiative> getInitiativeById(Long id) {
        return initiativeRepository.findById(id);
    }

    @Transactional
    public Initiative createInitiative(InitiativeRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Initiative initiative = new Initiative(
                request.getTitle(),
                request.getDescription(),
                request.getPriority(),
                request.getExpectedSavings(),
                request.getSite(),
                request.getDiscipline(),
                request.getStartDate(),
                request.getEndDate(),
                user
        );

        initiative.setRequiresMoc(request.getRequiresMoc());
        initiative.setRequiresCapex(request.getRequiresCapex());

        Initiative savedInitiative = initiativeRepository.save(initiative);

        // Create initial workflow stages and transactions
        createInitialWorkflowStages(savedInitiative);
        workflowTransactionService.createInitialWorkflowTransactions(savedInitiative);

        return savedInitiative;
    }

    private void createInitialWorkflowStages(Initiative initiative) {
        // New workflow stages as per the requirements
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

        String[] requiredRoles = {
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
            WorkflowStage stage = new WorkflowStage(i + 1, stageNames[i], requiredRoles[i], initiative);
            if (i == 0) {
                stage.setStatus("approved"); // First stage is automatically approved when created
            }
            workflowStageRepository.save(stage);
        }
    }

    @Transactional
    public Initiative updateInitiative(Long id, InitiativeRequest request) {
        Initiative initiative = initiativeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Initiative not found"));

        initiative.setTitle(request.getTitle());
        initiative.setDescription(request.getDescription());
        initiative.setPriority(request.getPriority());
        initiative.setExpectedSavings(request.getExpectedSavings());
        initiative.setSite(request.getSite());
        initiative.setDiscipline(request.getDiscipline());
        initiative.setStartDate(request.getStartDate());
        initiative.setEndDate(request.getEndDate());
        initiative.setRequiresMoc(request.getRequiresMoc());
        initiative.setRequiresCapex(request.getRequiresCapex());

        return initiativeRepository.save(initiative);
    }

    public void deleteInitiative(Long id) {
        initiativeRepository.deleteById(id);
    }

    public Long countByStatus(String status) {
        return initiativeRepository.countByStatus(status);
    }

    public List<Initiative> getInitiativesByPriority(String priority) {
        return initiativeRepository.findByPriority(priority);
    }
}