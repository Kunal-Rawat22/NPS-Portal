package com.pulse.survey.service;

import com.pulse.survey.dto.request.CreateBusinessUnitRequest;
import com.pulse.survey.dto.response.BusinessUnitDto;
import com.pulse.survey.entity.BusinessUnit;
import com.pulse.survey.exception.BadRequestException;
import com.pulse.survey.exception.ResourceNotFoundException;
import com.pulse.survey.repository.BusinessUnitRepository;
import com.pulse.survey.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BusinessUnitServiceTest {

    @Mock
    private BusinessUnitRepository buRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BusinessUnitService businessUnitService;

    @Test
    void getById_returnsDto() {
        UUID id = UUID.randomUUID();
        BusinessUnit bu = BusinessUnit.builder()
                .id(id)
                .name("Engineering")
                .build();
        when(buRepository.findById(id)).thenReturn(Optional.of(bu));

        BusinessUnitDto result = businessUnitService.getById(id);

        assertThat(result.id(), equalTo(id));
        assertThat(result.name(), equalTo("Engineering"));
    }

    @Test
    void create_throwsWhenNameExists() {
        CreateBusinessUnitRequest request = new CreateBusinessUnitRequest("Engineering", null);
        when(buRepository.existsByName("Engineering")).thenReturn(true);

        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> businessUnitService.create(request)
        );

        assertThat(ex.getMessage(), containsString("Business unit name already exists"));
        verify(buRepository, never()).save(any(BusinessUnit.class));
    }

    @Test
    void create_savesBusinessUnitWithoutHead() {
        CreateBusinessUnitRequest request = new CreateBusinessUnitRequest("Engineering", null);
        when(buRepository.existsByName("Engineering")).thenReturn(false);
        when(buRepository.save(any(BusinessUnit.class))).thenAnswer(invocation -> {
            BusinessUnit bu = invocation.getArgument(0);
            bu.setId(UUID.randomUUID());
            return bu;
        });

        BusinessUnitDto result = businessUnitService.create(request);

        assertThat(result.name(), equalTo("Engineering"));
        assertThat(result.id(), notNullValue());
        verify(buRepository).save(any(BusinessUnit.class));
        verify(userRepository, never()).findById(any());
    }

    @Test
    void create_throwsWhenHeadUserNotFound() {
        UUID headUserId = UUID.randomUUID();
        CreateBusinessUnitRequest request = new CreateBusinessUnitRequest("Engineering", headUserId);
        when(buRepository.existsByName("Engineering")).thenReturn(false);
        when(userRepository.findById(headUserId)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> businessUnitService.create(request)
        );

        assertThat(ex.getMessage(), containsString("Head user not found"));
        verify(buRepository, never()).save(any(BusinessUnit.class));
    }
}
