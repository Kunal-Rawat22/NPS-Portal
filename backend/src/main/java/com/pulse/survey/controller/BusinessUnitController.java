package com.pulse.survey.controller;

import com.pulse.survey.dto.request.CreateBusinessUnitRequest;
import com.pulse.survey.dto.response.BusinessUnitDto;
import com.pulse.survey.service.BusinessUnitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/business-units")
@RequiredArgsConstructor
public class BusinessUnitController {

    private final BusinessUnitService buService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'BU_HEAD')")
    public ResponseEntity<List<BusinessUnitDto>> getAll() {
        return ResponseEntity.ok(buService.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BU_HEAD')")
    public ResponseEntity<BusinessUnitDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(buService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BusinessUnitDto> create(@Valid @RequestBody CreateBusinessUnitRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(buService.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BusinessUnitDto> update(@PathVariable UUID id, @Valid @RequestBody CreateBusinessUnitRequest req) {
        return ResponseEntity.ok(buService.update(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        buService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
