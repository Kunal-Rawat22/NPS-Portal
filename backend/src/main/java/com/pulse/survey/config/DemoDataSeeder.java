package com.pulse.survey.config;

import com.pulse.survey.entity.BusinessUnit;
import com.pulse.survey.entity.Category;
import com.pulse.survey.entity.User;
import com.pulse.survey.enums.Role;
import com.pulse.survey.repository.BusinessUnitRepository;
import com.pulse.survey.repository.CategoryRepository;
import com.pulse.survey.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Seeds demo users, business units, and categories on startup.
 * Each record is inserted only when it does not already exist (matched by email / name).
 *
 * Default password for all seeded users: Admin@123
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DemoDataSeeder implements ApplicationRunner {

    static final String DEFAULT_PASSWORD = "Admin@123";

    private final UserRepository userRepository;
    private final BusinessUnitRepository businessUnitRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedCategories();
        Map<String, BusinessUnit> businessUnits = seedBusinessUnits();
        seedUsers(businessUnits);
        assignBusinessUnitHeads(businessUnits);
        log.info("Demo data seed check completed");
    }

    private void seedCategories() {
        List<CategorySeed> categories = List.of(
                new CategorySeed("Work Environment", "Office culture, tools, and workplace satisfaction"),
                new CategorySeed("Leadership", "Management effectiveness and communication"),
                new CategorySeed("Growth & Development", "Learning opportunities and career progression"),
                new CategorySeed("Compensation", "Pay, benefits, and rewards")
        );

        for (CategorySeed seed : categories) {
            if (categoryRepository.existsByName(seed.name())) {
                continue;
            }
            categoryRepository.save(Category.builder()
                    .name(seed.name())
                    .description(seed.description())
                    .build());
            log.info("Seeded category: {}", seed.name());
        }
    }

    private Map<String, BusinessUnit> seedBusinessUnits() {
        Map<String, BusinessUnit> units = new LinkedHashMap<>();
        for (String name : List.of("Engineering", "Sales & Marketing")) {
            BusinessUnit bu = businessUnitRepository.findByName(name)
                    .orElseGet(() -> {
                        log.info("Seeded business unit: {}", name);
                        return businessUnitRepository.save(BusinessUnit.builder().name(name).build());
                    });
            units.put(name, bu);
        }
        return units;
    }

    private void seedUsers(Map<String, BusinessUnit> businessUnits) {
        List<UserSeed> seeds = List.of(
                // BU Heads
                new UserSeed("eng.buhead@yourcompany.com", "Alex", "Engineering", Role.BU_HEAD,
                        "Engineering", null, null, null),
                new UserSeed("sales.buhead@yourcompany.com", "Sam", "Sales", Role.BU_HEAD,
                        "Sales & Marketing", null, null, null),

                // HRBPs
                new UserSeed("hrbp.eng@yourcompany.com", "Priya", "Sharma", Role.HRBP,
                        "Engineering", null, null, null),
                new UserSeed("hrbp.sales@yourcompany.com", "Jordan", "Lee", Role.HRBP,
                        "Sales & Marketing", null, null, null),

                // Engineering hierarchy
                new UserSeed("eng.manager@yourcompany.com", "Michael", "Chen", Role.EMPLOYEE,
                        "Engineering", "eng.buhead@yourcompany.com", "hrbp.eng@yourcompany.com", "Leadership"),
                new UserSeed("eng.dev1@yourcompany.com", "Emily", "Johnson", Role.EMPLOYEE,
                        "Engineering", "eng.manager@yourcompany.com", "hrbp.eng@yourcompany.com", "Java"),
                new UserSeed("eng.dev2@yourcompany.com", "David", "Kim", Role.EMPLOYEE,
                        "Engineering", "eng.manager@yourcompany.com", "hrbp.eng@yourcompany.com", "JavaScript"),
                new UserSeed("eng.qa@yourcompany.com", "Sarah", "Patel", Role.EMPLOYEE,
                        "Engineering", "eng.manager@yourcompany.com", "hrbp.eng@yourcompany.com", "QA"),
                new UserSeed("eng.intern@yourcompany.com", "Ryan", "Nguyen", Role.EMPLOYEE,
                        "Engineering", "eng.dev1@yourcompany.com", "hrbp.eng@yourcompany.com", "Java"),

                // Sales & Marketing hierarchy
                new UserSeed("sales.manager@yourcompany.com", "Lisa", "Martinez", Role.EMPLOYEE,
                        "Sales & Marketing", "sales.buhead@yourcompany.com", "hrbp.sales@yourcompany.com", "Sales"),
                new UserSeed("sales.rep1@yourcompany.com", "Tom", "Wilson", Role.EMPLOYEE,
                        "Sales & Marketing", "sales.manager@yourcompany.com", "hrbp.sales@yourcompany.com", "Sales"),
                new UserSeed("sales.rep2@yourcompany.com", "Anna", "Brown", Role.EMPLOYEE,
                        "Sales & Marketing", "sales.manager@yourcompany.com", "hrbp.sales@yourcompany.com", "Sales"),
                new UserSeed("marketing.lead@yourcompany.com", "Chris", "Taylor", Role.EMPLOYEE,
                        "Sales & Marketing", "sales.buhead@yourcompany.com", "hrbp.sales@yourcompany.com", "Marketing"),
                new UserSeed("marketing.assoc@yourcompany.com", "Nina", "Garcia", Role.EMPLOYEE,
                        "Sales & Marketing", "marketing.lead@yourcompany.com", "hrbp.sales@yourcompany.com", "Marketing")
        );

        for (UserSeed seed : seeds) {
            if (userRepository.existsByEmail(seed.email())) {
                continue;
            }

            User user = User.builder()
                    .email(seed.email())
                    .passwordHash(passwordEncoder.encode(DEFAULT_PASSWORD))
                    .firstName(seed.firstName())
                    .lastName(seed.lastName())
                    .role(seed.role())
                    .competency(seed.competency())
                    .isActive(true)
                    .build();

            if (seed.businessUnitName() != null) {
                BusinessUnit bu = businessUnits.get(seed.businessUnitName());
                if (bu != null) {
                    user.setBusinessUnit(bu);
                }
            }

            if (seed.reportingToEmail() != null) {
                userRepository.findByEmail(seed.reportingToEmail()).ifPresent(user::setReportingTo);
            }

            if (seed.hrbpEmail() != null) {
                userRepository.findByEmail(seed.hrbpEmail()).ifPresent(user::setHrbp);
            }

            userRepository.save(user);
            log.info("Seeded user: {} ({})", seed.email(), seed.role());
        }
    }

    private void assignBusinessUnitHeads(Map<String, BusinessUnit> businessUnits) {
        assignHeadIfMissing(businessUnits.get("Engineering"), "eng.buhead@yourcompany.com");
        assignHeadIfMissing(businessUnits.get("Sales & Marketing"), "sales.buhead@yourcompany.com");
    }

    private void assignHeadIfMissing(BusinessUnit bu, String headEmail) {
        if (bu == null || bu.getHeadUser() != null) {
            return;
        }
        userRepository.findByEmail(headEmail).ifPresent(head -> {
            bu.setHeadUser(head);
            businessUnitRepository.save(bu);
            log.info("Assigned BU head {} to {}", headEmail, bu.getName());
        });
    }

    private record CategorySeed(String name, String description) {}

    private record UserSeed(
            String email,
            String firstName,
            String lastName,
            Role role,
            String businessUnitName,
            String reportingToEmail,
            String hrbpEmail,
            String competency
    ) {}
}
