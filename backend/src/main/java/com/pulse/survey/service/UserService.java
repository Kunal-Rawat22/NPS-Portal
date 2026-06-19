package com.pulse.survey.service;

import com.pulse.survey.dto.request.CreateUserRequest;
import com.pulse.survey.dto.request.UpdateUserRequest;
import com.pulse.survey.dto.response.UserDto;
import com.pulse.survey.entity.BusinessUnit;
import com.pulse.survey.entity.User;
import com.pulse.survey.exception.BadRequestException;
import com.pulse.survey.exception.ResourceNotFoundException;
import com.pulse.survey.repository.BusinessUnitRepository;
import com.pulse.survey.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
}
