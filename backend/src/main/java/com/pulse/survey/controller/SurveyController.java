package com.pulse.survey.controller;

import com.pulse.survey.dto.request.CreateQuestionRequest;
import com.pulse.survey.dto.request.CreateSurveyRequest;
import com.pulse.survey.dto.response.QuestionDto;
import com.pulse.survey.dto.response.SurveyDto;
import com.pulse.survey.security.UserPrincipal;
import com.pulse.survey.service.SurveyService;
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
@RequestMapping("/api/surveys")
@RequiredArgsConstructor
public class SurveyController {

    private final SurveyService surveyService;

    @GetMapping
    public ResponseEntity<List<SurveyDto>> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal.getRole().name().equals("EMPLOYEE")) {
            return ResponseEntity.ok(surveyService.getForEmployee());
        }
        return ResponseEntity.ok(surveyService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SurveyDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(surveyService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SurveyDto> create(@Valid @RequestBody CreateSurveyRequest req,
                                             @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(surveyService.create(req, principal.getId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SurveyDto> update(@PathVariable UUID id, @Valid @RequestBody CreateSurveyRequest req) {
        return ResponseEntity.ok(surveyService.update(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        surveyService.delete(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SurveyDto> activate(@PathVariable UUID id) {
        return ResponseEntity.ok(surveyService.activate(id));
    }

    @PutMapping("/{id}/close")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SurveyDto> close(@PathVariable UUID id) {
        return ResponseEntity.ok(surveyService.close(id));
    }

    @PutMapping("/{id}/reopen")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SurveyDto> reopen(@PathVariable UUID id) {
        return ResponseEntity.ok(surveyService.reopen(id));
    }

    @GetMapping("/{surveyId}/questions")
    public ResponseEntity<List<QuestionDto>> getQuestions(@PathVariable UUID surveyId) {
        return ResponseEntity.ok(surveyService.getQuestions(surveyId));
    }

    @PostMapping("/{surveyId}/questions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuestionDto> addQuestion(@PathVariable UUID surveyId,
                                                    @Valid @RequestBody CreateQuestionRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(surveyService.addQuestion(surveyId, req));
    }

    @PutMapping("/{surveyId}/questions/{questionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuestionDto> updateQuestion(@PathVariable UUID surveyId,
                                                       @PathVariable UUID questionId,
                                                       @Valid @RequestBody CreateQuestionRequest req) {
        return ResponseEntity.ok(surveyService.updateQuestion(surveyId, questionId, req));
    }

    @DeleteMapping("/{surveyId}/questions/{questionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteQuestion(@PathVariable UUID surveyId, @PathVariable UUID questionId) {
        surveyService.deleteQuestion(surveyId, questionId);
        return ResponseEntity.ok().build();
    }
}
