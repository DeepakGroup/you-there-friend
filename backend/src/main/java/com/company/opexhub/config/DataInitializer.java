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
        // Create demo users for testing
        User[] demoUsers = {
            new User("John Smith", "john.lead@company.com", 
                    passwordEncoder.encode("password123"), "LAM", "MECH", "INIT_LEAD", "Initiative Lead"),
            
            new User("Sarah Johnson", "sarah.approver@company.com", 
                    passwordEncoder.encode("password123"), "LAM", "ELECT", "APPROVER", "Department Approver"),
            
            new User("Mike Wilson", "mike.tso@company.com", 
                    passwordEncoder.encode("password123"), "LAM", "PROCESS", "SITE_TSO_LEAD", "Site TSO Lead"),
            
            new User("Lisa Brown", "lisa.corp@company.com", 
                    passwordEncoder.encode("password123"), "Corporate", "OPEX", "CORP_TSO", "Corporate TSO"),
            
            new User("Alex Davis", "alex.manager@company.com", 
                    passwordEncoder.encode("password123"), "LAM", "MAINT", "SITE_MANAGER", "Site Manager"),
            
            new User("Emma Wilson", "emma.lead@company.com", 
                    passwordEncoder.encode("password123"), "NDS", "OP", "INIT_LEAD", "Initiative Lead"),
            
            new User("David Brown", "david.approver@company.com", 
                    passwordEncoder.encode("password123"), "HSD1", "EG", "APPROVER", "Department Approver"),
            
            new User("Sophie Davis", "sophie.tso@company.com", 
                    passwordEncoder.encode("password123"), "HSD2", "EV", "SITE_TSO_LEAD", "Site TSO Lead"),
            
            new User("James Miller", "james.corp@company.com", 
                    passwordEncoder.encode("password123"), "Corporate", "SF", "CORP_TSO", "Corporate TSO"),
            
            new User("Rachel Green", "rachel.manager@company.com", 
                    passwordEncoder.encode("password123"), "DHJ", "QA", "SITE_MANAGER", "Site Manager")
        };

        for (User user : demoUsers) {
            userRepository.save(user);
        }

        System.out.println("Demo users initialized successfully!");
        System.out.println("=== LOGIN CREDENTIALS ===");
        System.out.println("Email: john.lead@company.com | Password: password123 | Role: Initiative Lead");
        System.out.println("Email: sarah.approver@company.com | Password: password123 | Role: Department Approver");
        System.out.println("Email: mike.tso@company.com | Password: password123 | Role: Site TSO Lead");
        System.out.println("Email: lisa.corp@company.com | Password: password123 | Role: Corporate TSO");
        System.out.println("Email: alex.manager@company.com | Password: password123 | Role: Site Manager");
        System.out.println("========================");
    }
}