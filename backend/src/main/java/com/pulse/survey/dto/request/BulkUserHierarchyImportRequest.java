package com.pulse.survey.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record BulkUserHierarchyImportRequest(
    @NotEmpty @Valid List<UserHierarchyImportRow> rows
) {}
