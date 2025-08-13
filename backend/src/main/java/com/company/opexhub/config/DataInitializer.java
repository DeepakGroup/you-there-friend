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
        // Create 11 users for 11 workflow stages - All users assigned to NDS site
        User[] demoUsers = {
            // Stage 1: Register Initiative - Initiative Lead
            new User("Rajesh Kumar", "rajesh.kumar@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "MECH", "INIT_LEAD", "Initiative Lead"),
            
            // Stage 2: Approval (Decision Point) - Approver  
            new User("Priya Sharma", "priya.sharma@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "ELECT", "APPROVER", "Department Approver"),
            
            // Stage 3: Assign Initiative ID & Define Responsibilities - Site TSO Lead
            new User("Amit Patel", "amit.patel@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "PROCESS", "SITE_TSO_LEAD", "Site TSO Lead"),
            
            // Stages 4-6: MOC Related - Initiative Lead  
            new User("Deepika Singh", "deepika.singh@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "OPEX", "INIT_LEAD", "Initiative Lead"),
            
            // Stages 7-9: CAPEX Related - Site TSO Lead
            new User("Vikram Gupta", "vikram.gupta@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "MAINT", "SITE_TSO_LEAD", "Site TSO Lead"),
            
            // Stage 10: Prepare Initiative Timeline Tracker - Initiative Lead
            new User("Neha Agarwal", "neha.agarwal@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "OP", "INIT_LEAD", "Initiative Lead"),
            
            // Stage 11: Trial Implementation - Site TSO Lead
            new User("Suresh Reddy", "suresh.reddy@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "EG", "SITE_TSO_LEAD", "Site TSO Lead"),
            
            // Stage 12: Periodic Status Review with CMO - Corporate TSO
            new User("Kavya Nair", "kavya.nair@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "EV", "CORP_TSO", "Corporate TSO"),
            
            // Stages 13-14: Savings Monitoring & Validation - Site Corp TSO
            new User("Rohit Jain", "rohit.jain@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "SF", "SITE_CORP_TSO", "Site Corp TSO"),
            
            // Stage 15: Initiative Closure - Site TSO Lead
            new User("Ananya Verma", "ananya.verma@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "QA", "SITE_TSO_LEAD", "Site TSO Lead"),
            
            // Only SITE TSD LEAD can create new initiatives
            new User("Manoj Tiwari", "manoj.tiwari@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "TSD", "SITE_TSD_LEAD", "Site TSD Lead")
        };

        for (User user : demoUsers) {
            userRepository.save(user);
        }

        System.out.println("Demo users initialized successfully!");
        System.out.println("=== LOGIN CREDENTIALS (All NDS Site Users) ===");
        System.out.println("Email: rajesh.kumar@godeepak.com | Password: password123 | Role: Initiative Lead (Stage 1)");
        System.out.println("Email: priya.sharma@godeepak.com | Password: password123 | Role: Department Approver (Stage 2)");
        System.out.println("Email: amit.patel@godeepak.com | Password: password123 | Role: Site TSO Lead (Stage 3)");
        System.out.println("Email: deepika.singh@godeepak.com | Password: password123 | Role: Initiative Lead (MOC Stages)");
        System.out.println("Email: vikram.gupta@godeepak.com | Password: password123 | Role: Site TSO Lead (CAPEX Stages)");
        System.out.println("Email: neha.agarwal@godeepak.com | Password: password123 | Role: Initiative Lead (Stage 10)");
        System.out.println("Email: suresh.reddy@godeepak.com | Password: password123 | Role: Site TSO Lead (Stage 11)");
        System.out.println("Email: kavya.nair@godeepak.com | Password: password123 | Role: Corporate TSO (Stage 12)");
        System.out.println("Email: rohit.jain@godeepak.com | Password: password123 | Role: Site Corp TSO (Stages 13-14)");
        System.out.println("Email: ananya.verma@godeepak.com | Password: password123 | Role: Site TSO Lead (Stage 15)");
        System.out.println("Email: manoj.tiwari@godeepak.com | Password: password123 | Role: Site TSD Lead (CREATE INITIATIVES)");
        System.out.println("========================");
    }

    private void initializeWorkflowStages() {
        // Workflow stage definitions with proper names and roles
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