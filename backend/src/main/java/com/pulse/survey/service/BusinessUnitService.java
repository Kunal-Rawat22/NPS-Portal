package com.pulse.survey.service;

import com.pulse.survey.dto.request.CreateBusinessUnitRequest;
import com.pulse.survey.dto.response.BusinessUnitDto;
import com.pulse.survey.entity.BusinessUnit;
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
public class BusinessUnitService {

    private final BusinessUnitRepository buRepository;
    private final UserRepository userRepository;

    public List<BusinessUnitDto> getAll() {
        return buRepository.findAll().stream().map(BusinessUnitDto::from).toList();
    }

    public BusinessUnitDto getById(UUID id) {
        return BusinessUnitDto.from(findBU(id));
    }

    @Transactional
    public BusinessUnitDto create(CreateBusinessUnitRequest req) {
        if (buRepository.existsByName(req.name())) {
            throw new BadRequestException("Business unit name already exists: " + req.name());
        }
        BusinessUnit.BusinessUnitBuilder builder = BusinessUnit.builder().name(req.name());
        if (req.headUserId() != null) {
            builder.headUser(userRepository.findById(req.headUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Head user not found")));
        }
        return BusinessUnitDto.from(buRepository.save(builder.build()));
    }

    @Transactional
    public BusinessUnitDto update(UUID id, CreateBusinessUnitRequest req) {
        BusinessUnit bu = findBU(id);
        bu.setName(req.name());
        if (req.headUserId() != null) {
            bu.setHeadUser(userRepository.findById(req.headUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Head user not found")));
        }
        return BusinessUnitDto.from(buRepository.save(bu));
    }

    @Transactional
    public void delete(UUID id) {
        buRepository.delete(findBU(id));
    }

    private BusinessUnit findBU(UUID id) {
        return buRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Business unit not found: " + id));
    }
}
