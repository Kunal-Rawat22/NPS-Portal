package com.pulse.survey.controller;

import com.pulse.survey.dto.request.SaveResponseRequest;
import com.pulse.survey.dto.response.SurveyResponseDto;
import com.pulse.survey.security.UserPrincipal;
import com.pulse.survey.service.ResponseService;
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
@RequestMapping("/api")
@RequiredArgsConstructor
public class ResponseController {

    private final ResponseService responseService;

    @GetMapping("/surveys/{surveyId}/my-response")
    public ResponseEntity<SurveyResponseDto> getMyResponse(@PathVariable UUID surveyId,
                                                             @AuthenticationPrincipal UserPrincipal principal) {
        SurveyResponseDto res = responseService.getMyResponse(surveyId, principal.getId());
        if (res == null) return ResponseEntity.ok(null);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/surveys/{surveyId}/responses")
    public ResponseEntity<SurveyResponseDto> start(@PathVariable UUID surveyId,
                                                    @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(responseService.startResponse(surveyId, principal.getId()));
    }

    @PutMapping("/responses/{id}")
    public ResponseEntity<SurveyResponseDto> saveDraft(@PathVariable UUID id,
                                                        @Valid @RequestBody SaveResponseRequest req,
                                                        @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(responseService.saveDraft(id, principal.getId(), req));
    }

    @PostMapping("/responses/{id}/submit")
    public ResponseEntity<SurveyResponseDto> submit(@PathVariable UUID id,
                                                     @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(responseService.submit(id, principal.getId()));
    }

    @GetMapping("/surveys/{surveyId}/responses")
    @PreAuthorize("hasAnyRole('ADMIN', 'BU_HEAD', 'HRBP')")
    public ResponseEntity<List<SurveyResponseDto>> getAllBySurvey(@PathVariable UUID surveyId) {
        return ResponseEntity.ok(responseService.getAllResponsesBySurvey(surveyId));
    }
}
