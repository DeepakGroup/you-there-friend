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

        // Create initial workflow stages
        createInitialWorkflowStages(savedInitiative);

        return savedInitiative;
    }

    private void createInitialWorkflowStages(Initiative initiative) {
        String[] stageNames = {
            "Draft Submission", "Initial Review", "Technical Assessment", 
            "Site TSO Review", "Resource Planning", "Budget Approval",
            "Corporate Review", "Implementation Planning", "Execution Phase",
            "Progress Monitoring", "Quality Check", "Performance Review",
            "Benefits Realization", "Documentation", "Project Closure"
        };

        String[] requiredRoles = {
            "INIT_LEAD", "APPROVER", "APPROVER", "SITE_TSO_LEAD", "APPROVER",
            "APPROVER", "CORP_TSO", "SITE_TSO_LEAD", "INIT_LEAD", "APPROVER",
            "APPROVER", "CORP_TSO", "APPROVER", "INIT_LEAD", "APPROVER"
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