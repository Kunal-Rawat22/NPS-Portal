package com.pulse.survey.service;

import com.pulse.survey.dto.request.CreateUserRequest;
import com.pulse.survey.dto.request.UpdateUserRequest;
import com.pulse.survey.dto.request.UserHierarchyImportRow;
import com.pulse.survey.dto.request.UserImportRow;
import com.pulse.survey.dto.response.BulkImportResult;
import com.pulse.survey.dto.response.ImportRowError;
import com.pulse.survey.dto.response.UserDto;
import com.pulse.survey.entity.BusinessUnit;
import com.pulse.survey.entity.User;
import com.pulse.survey.enums.Role;
import com.pulse.survey.exception.BadRequestException;
import com.pulse.survey.exception.ResourceNotFoundException;
import com.pulse.survey.repository.BusinessUnitRepository;
import com.pulse.survey.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BusinessUnitRepository buRepository;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(UserDto::from).toList();
    }

    public UserDto getUserById(UUID id) {
        return UserDto.from(findUser(id));
    }

    @Transactional
    public UserDto createUser(CreateUserRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new BadRequestException("Email already exists: " + req.email());
        }

        User.UserBuilder builder = User.builder()
                .email(req.email())
                .firstName(req.firstName())
                .lastName(req.lastName())
                .role(req.role())
                .competency(req.competency());

        if (req.businessUnitId() != null) {
            BusinessUnit bu = buRepository.findById(req.businessUnitId())
                    .orElseThrow(() -> new ResourceNotFoundException("Business unit not found"));
            builder.businessUnit(bu);
        }
        if (req.reportingToId() != null) {
            builder.reportingTo(findUser(req.reportingToId()));
        }
        if (req.hrbpId() != null) {
            builder.hrbp(findUser(req.hrbpId()));
        }

        return UserDto.from(userRepository.save(builder.build()));
    }

    @Transactional
    public UserDto updateUser(UUID id, UpdateUserRequest req) {
        User user = findUser(id);
        if (req.firstName() != null) user.setFirstName(req.firstName());
        if (req.lastName() != null) user.setLastName(req.lastName());
        if (req.role() != null) user.setRole(req.role());
        if (req.competency() != null) user.setCompetency(req.competency());
        if (req.isActive() != null) user.setActive(req.isActive());
        if (req.businessUnitId() != null) {
            user.setBusinessUnit(buRepository.findById(req.businessUnitId())
                    .orElseThrow(() -> new ResourceNotFoundException("Business unit not found")));
        }
        if (req.reportingToId() != null) {
            user.setReportingTo(findUser(req.reportingToId()));
        }
        if (req.hrbpId() != null) {
            user.setHrbp(findUser(req.hrbpId()));
        }
        return UserDto.from(userRepository.save(user));
    }

    @Transactional
    public void deactivateUser(UUID id) {
        User user = findUser(id);
        user.setActive(false);
        userRepository.save(user);
    }

    public List<UserDto> getUserHierarchy(UUID userId) {
        return userRepository.findAllInHierarchy(userId).stream().map(UserDto::from).toList();
    }

    public List<UserDto> getDirectHrbpReports(UUID hrbpId) {
        return userRepository.findByHrbpId(hrbpId).stream().map(UserDto::from).toList();
    }

    public User findUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    @Transactional
    public BulkImportResult importUsers(List<UserImportRow> rows) {
        int created = 0;
        int updated = 0;
        int failed = 0;
        List<ImportRowError> errors = new ArrayList<>();

        for (int i = 0; i < rows.size(); i++) {
            UserImportRow row = rows.get(i);
            int rowNum = i + 2;
            try {
                String email = row.email().trim().toLowerCase();
                String[] nameParts = splitName(row.name());
                Role role = parseRole(row.role());
                boolean isActive = parseStatus(row.status());
                BusinessUnit bu = findBusinessUnitByName(row.businessUnit());

                var existing = userRepository.findByEmail(email);
                if (existing.isPresent()) {
                    User user = existing.get();
                    user.setFirstName(nameParts[0]);
                    user.setLastName(nameParts[1]);
                    user.setRole(role);
                    user.setActive(isActive);
                    user.setBusinessUnit(bu);
                    userRepository.save(user);
                    updated++;
                } else {
                    User user = User.builder()
                            .email(email)
                            .firstName(nameParts[0])
                            .lastName(nameParts[1])
                            .role(role)
                            .isActive(isActive)
                            .businessUnit(bu)
                            .build();
                    userRepository.save(user);
                    created++;
                }
            } catch (Exception ex) {
                failed++;
                errors.add(new ImportRowError(rowNum, row.email(), ex.getMessage()));
            }
        }

        return new BulkImportResult(created, updated, failed, errors);
    }

    @Transactional
    public BulkImportResult importHierarchy(List<UserHierarchyImportRow> rows) {
        int updated = 0;
        int failed = 0;
        List<ImportRowError> errors = new ArrayList<>();

        for (int i = 0; i < rows.size(); i++) {
            UserHierarchyImportRow row = rows.get(i);
            int rowNum = i + 2;
            try {
                String email = row.email().trim().toLowerCase();
                User user = userRepository.findByEmail(email)
                        .orElseThrow(() -> new BadRequestException("User not found: " + email));

                boolean changed = false;

                if (row.hrbpEmail() != null && !row.hrbpEmail().isBlank()) {
                    String hrbpEmail = row.hrbpEmail().trim().toLowerCase();
                    User hrbp = userRepository.findByEmail(hrbpEmail)
                            .orElseThrow(() -> new BadRequestException("HRBP not found: " + hrbpEmail));
                    user.setHrbp(hrbp);
                    changed = true;
                }

                if (row.rmEmail() != null && !row.rmEmail().isBlank()) {
                    String rmEmail = row.rmEmail().trim().toLowerCase();
                    User rm = userRepository.findByEmail(rmEmail)
                            .orElseThrow(() -> new BadRequestException("Reporting manager not found: " + rmEmail));
                    user.setReportingTo(rm);
                    changed = true;
                }

                if (!changed) {
                    throw new BadRequestException("At least one of HRBP Email or RM Email must be provided");
                }

                userRepository.save(user);
                updated++;
            } catch (Exception ex) {
                failed++;
                errors.add(new ImportRowError(rowNum, row.email(), ex.getMessage()));
            }
        }

        return new BulkImportResult(0, updated, failed, errors);
    }

    private String[] splitName(String name) {
        String trimmed = name.trim();
        if (trimmed.isEmpty()) {
            throw new BadRequestException("Name is required");
        }
        int spaceIdx = trimmed.indexOf(' ');
        if (spaceIdx < 0) {
            return new String[]{trimmed, "-"};
        }
        return new String[]{trimmed.substring(0, spaceIdx), trimmed.substring(spaceIdx + 1).trim()};
    }

    private Role parseRole(String roleStr) {
        try {
            return Role.valueOf(roleStr.trim().toUpperCase().replace(' ', '_'));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid role: " + roleStr);
        }
    }

    private boolean parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return true;
        }
        String normalized = status.trim().toLowerCase();
        return switch (normalized) {
            case "active", "yes", "true", "1" -> true;
            case "inactive", "no", "false", "0" -> false;
            default -> throw new BadRequestException("Invalid status: " + status);
        };
    }

    private BusinessUnit findBusinessUnitByName(String name) {
        if (name == null || name.isBlank()) {
            return null;
        }
        String trimmed = name.trim();
        return buRepository.findByName(trimmed)
                .or(() -> buRepository.findAll().stream()
                        .filter(bu -> bu.getName().equalsIgnoreCase(trimmed))
                        .findFirst())
                .orElseThrow(() -> new BadRequestException("Business unit not found: " + name));
    }
}
