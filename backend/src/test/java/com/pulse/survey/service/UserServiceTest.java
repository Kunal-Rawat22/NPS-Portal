package com.pulse.survey.service;

import com.pulse.survey.dto.request.CreateUserRequest;
import com.pulse.survey.dto.request.UserImportRow;
import com.pulse.survey.dto.response.BulkImportResult;
import com.pulse.survey.dto.response.UserDto;
import com.pulse.survey.entity.User;
import com.pulse.survey.enums.Role;
import com.pulse.survey.exception.BadRequestException;
import com.pulse.survey.exception.ResourceNotFoundException;
import com.pulse.survey.repository.BusinessUnitRepository;
import com.pulse.survey.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BusinessUnitRepository buRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void getAllUsers_returnsMappedDtos() {
        User user1 = User.builder()
                .id(UUID.randomUUID())
                .email("alice@example.com")
                .firstName("Alice")
                .lastName("Smith")
                .role(Role.EMPLOYEE)
                .build();
        User user2 = User.builder()
                .id(UUID.randomUUID())
                .email("bob@example.com")
                .firstName("Bob")
                .lastName("Jones")
                .role(Role.HRBP)
                .build();
        when(userRepository.findAll()).thenReturn(List.of(user1, user2));

        List<UserDto> result = userService.getAllUsers();

        assertThat(result, hasSize(2));
        assertThat(result.get(0).email(), equalTo("alice@example.com"));
        assertThat(result.get(1).email(), equalTo("bob@example.com"));
    }

    @Test
    void getUserById_throwsWhenNotFound() {
        UUID id = UUID.randomUUID();
        when(userRepository.findById(id)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> userService.getUserById(id)
        );

        assertThat(ex.getMessage(), containsString("User not found"));
    }

    @Test
    void createUser_throwsWhenEmailExists() {
        CreateUserRequest request = new CreateUserRequest(
                "john@example.com", "John", "Doe", Role.EMPLOYEE,
                null, null, null, null
        );
        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> userService.createUser(request)
        );

        assertThat(ex.getMessage(), containsString("Email already exists"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void createUser_savesAndReturnsUserDto() {
        CreateUserRequest request = new CreateUserRequest(
                "john@example.com", "John", "Doe", Role.EMPLOYEE,
                null, null, null, "Java"
        );
        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(UUID.randomUUID());
            return user;
        });

        UserDto result = userService.createUser(request);

        assertThat(result.email(), equalTo("john@example.com"));
        assertThat(result.firstName(), is("John"));
        assertThat(result.lastName(), is("Doe"));
        assertThat(result.role(), is(Role.EMPLOYEE));
        assertThat(result.competency(), equalTo("Java"));
        verify(userRepository).save(any(User.class));
    }

    @Test
    void deactivateUser_setsActiveFalseAndSaves() {
        UUID id = UUID.randomUUID();
        User user = User.builder()
                .id(id)
                .email("john@example.com")
                .firstName("John")
                .lastName("Doe")
                .role(Role.EMPLOYEE)
                .isActive(true)
                .build();
        when(userRepository.findById(id)).thenReturn(Optional.of(user));

        userService.deactivateUser(id);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().isActive(), is(false));
    }

    @Test
    void importUsers_createsNewUser() {
        UserImportRow row = new UserImportRow(
                "John Doe", "john@example.com", "EMPLOYEE", null, "active"
        );
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(UUID.randomUUID());
            return user;
        });

        BulkImportResult result = userService.importUsers(List.of(row));

        assertThat(result.created(), is(1));
        assertThat(result.updated(), is(0));
        assertThat(result.failed(), is(0));
        assertThat(result.errors(), is(empty()));
        verify(userRepository).save(any(User.class));
    }
}
