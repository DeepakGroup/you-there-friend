package com.company.opexhub.config;

import com.company.opexhub.entity.User;
import com.company.opexhub.repository.UserRepository;
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

    @Override
    public void run(String... args) throws Exception {
        // Check if users already exist
        if (userRepository.count() == 0) {
            initializeUsers();
        }
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
}