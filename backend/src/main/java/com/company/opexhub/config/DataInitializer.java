package com.company.opexhub.config;

import com.company.opexhub.entity.User;
import com.company.opexhub.entity.Initiative;
import com.company.opexhub.entity.WorkflowStage;
import com.company.opexhub.repository.UserRepository;
import com.company.opexhub.repository.InitiativeRepository;
import com.company.opexhub.repository.WorkflowStageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private InitiativeRepository initiativeRepository;

    @Autowired
    private WorkflowStageRepository workflowStageRepository;

    @Override
    public void run(String... args) throws Exception {
        // Check if users already exist
        if (userRepository.count() == 0) {
            initializeUsers();
        }
        
        // Check if workflow stages need to be initialized for existing initiatives
        initializeWorkflowStages();
    }

    private void initializeUsers() {
        // Create demo users for testing - All users assigned to NDS site with Indian names
        User[] demoUsers = {
            new User("Rajesh Kumar", "rajesh.lead@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "MECH", "INIT_LEAD", "Initiative Lead"),
            
            new User("Priya Sharma", "priya.approver@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "ELECT", "APPROVER", "Department Approver"),
            
            new User("Amit Patel", "amit.tso@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "PROCESS", "SITE_TSO_LEAD", "Site TSO Lead"),
            
            new User("Deepika Singh", "deepika.corp@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "OPEX", "CORP_TSO", "Corporate TSO"),
            
            new User("Vikram Gupta", "vikram.manager@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "MAINT", "SITE_MANAGER", "Site Manager"),
            
            new User("Neha Agarwal", "neha.lead@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "OP", "INIT_LEAD", "Initiative Lead"),
            
            new User("Suresh Reddy", "suresh.approver@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "EG", "APPROVER", "Department Approver"),
            
            new User("Kavya Nair", "kavya.tso@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "EV", "SITE_TSO_LEAD", "Site TSO Lead"),
            
            new User("Rohit Jain", "rohit.corp@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "SF", "CORP_TSO", "Corporate TSO"),
            
            new User("Ananya Verma", "ananya.manager@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "QA", "SITE_MANAGER", "Site Manager")
        };

        for (User user : demoUsers) {
            userRepository.save(user);
        }

        System.out.println("Demo users initialized successfully!");
        System.out.println("=== LOGIN CREDENTIALS (All NDS Site Users) ===");
        System.out.println("Email: rajesh.lead@godeepak.com | Password: password123 | Role: Initiative Lead");
        System.out.println("Email: priya.approver@godeepak.com | Password: password123 | Role: Department Approver");
        System.out.println("Email: amit.tso@godeepak.com | Password: password123 | Role: Site TSO Lead");
        System.out.println("Email: deepika.corp@godeepak.com | Password: password123 | Role: Corporate TSO");
        System.out.println("Email: vikram.manager@godeepak.com | Password: password123 | Role: Site Manager");
        System.out.println("Email: neha.lead@godeepak.com | Password: password123 | Role: Initiative Lead");
        System.out.println("========================");
    }

    private void initializeWorkflowStages() {
        // Workflow stage definitions with proper names
        String[][] stageDefinitions = {
            {"1", "Register Initiative", "INIT_LEAD"},
            {"2", "Approval (Decision Point)", "APPROVER"},
            {"3", "Assign Initiative ID & Define Responsibilities", "SITE_TSO_LEAD"},
            {"4", "MOC Required? (Decision Point)", "INIT_LEAD"},
            {"5", "MOC", "INIT_LEAD"},
            {"6", "MOC Approved", "INIT_LEAD"},
            {"7", "CAPEX Required? (Decision Point)", "INIT_LEAD"},
            {"8", "CAPEX Process", "SITE_TSO_LEAD"},
            {"9", "CAPEX Approved", "SITE_TSO_LEAD"},
            {"10", "Prepare Initiative Timeline Tracker", "INIT_LEAD"},
            {"11", "Trial Implementation and Performance Check", "SITE_TSO_LEAD"},
            {"12", "Periodic Status Review with CMO", "CORP_TSO"},
            {"13", "Savings Monitoring for 1 Month", "SITE_CORP_TSO"},
            {"14", "Savings Validation with F&A", "SITE_CORP_TSO"},
            {"15", "Initiative Closure", "SITE_TSO_LEAD"}
        };

        // Initialize workflow stages for all initiatives that don't have them
        for (Initiative initiative : initiativeRepository.findAll()) {
            if (workflowStageRepository.findByInitiativeIdOrderByStageNumber(initiative.getId()).isEmpty()) {
                for (String[] stageDef : stageDefinitions) {
                    WorkflowStage stage = new WorkflowStage();
                    stage.setStageNumber(Integer.parseInt(stageDef[0]));
                    stage.setStageName(stageDef[1]);
                    stage.setRequiredRole(stageDef[2]);
                    stage.setInitiative(initiative);
                    
                    // Set status based on current stage
                    if (Integer.parseInt(stageDef[0]) < initiative.getCurrentStage()) {
                        stage.setStatus("approved");
                        stage.setApprovedBy("System");
                    } else if (Integer.parseInt(stageDef[0]) == initiative.getCurrentStage()) {
                        stage.setStatus("pending");
                    } else {
                        stage.setStatus("not_started");
                    }
                    
                    workflowStageRepository.save(stage);
                }
                System.out.println("Initialized workflow stages for initiative: " + initiative.getTitle());
            }
        }
    }
}