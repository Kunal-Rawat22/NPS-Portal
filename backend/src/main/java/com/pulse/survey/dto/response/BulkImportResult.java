package com.pulse.survey.dto.response;

import java.util.List;

public record BulkImportResult(
    int created,
    int updated,
    int failed,
    List<ImportRowError> errors
) {}
