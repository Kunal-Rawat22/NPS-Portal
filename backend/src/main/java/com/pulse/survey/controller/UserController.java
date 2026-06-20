package com.pulse.survey.controller;

import com.pulse.survey.dto.request.BulkUserHierarchyImportRequest;
import com.pulse.survey.dto.request.BulkUserImportRequest;
import com.pulse.survey.dto.request.CreateUserRequest;
import com.pulse.survey.dto.request.UpdateUserRequest;
import com.pulse.survey.dto.response.BulkImportResult;
import com.pulse.survey.dto.response.UserDto;
import com.pulse.survey.security.UserPrincipal;
import com.pulse.survey.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAll() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(userService.getUserById(principal.getId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> create(@Valid @RequestBody CreateUserRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> update(@PathVariable UUID id, @RequestBody UpdateUserRequest req) {
        return ResponseEntity.ok(userService.updateUser(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivate(@PathVariable UUID id) {
        userService.deactivateUser(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/hierarchy")
    @PreAuthorize("hasAnyRole('ADMIN', 'HRBP')")
    public ResponseEntity<List<UserDto>> getHierarchy(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserHierarchy(id));
    }

    @GetMapping("/hrbp/{hrbpId}/direct")
    @PreAuthorize("hasAnyRole('ADMIN', 'HRBP')")
    public ResponseEntity<List<UserDto>> getDirectReports(@PathVariable UUID hrbpId) {
        return ResponseEntity.ok(userService.getDirectHrbpReports(hrbpId));
    }

    @PostMapping("/import")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BulkImportResult> importUsers(@Valid @RequestBody BulkUserImportRequest req) {
        return ResponseEntity.ok(userService.importUsers(req.rows()));
    }

    @PostMapping("/import-hierarchy")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BulkImportResult> importHierarchy(@Valid @RequestBody BulkUserHierarchyImportRequest req) {
        return ResponseEntity.ok(userService.importHierarchy(req.rows()));
    }
}
