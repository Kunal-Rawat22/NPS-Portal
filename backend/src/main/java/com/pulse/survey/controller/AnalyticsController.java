package com.pulse.survey.controller;

import com.pulse.survey.dto.response.AnalyticsAnswerDetailDto;
import com.pulse.survey.dto.response.AnalyticsOverviewDto;
import com.pulse.survey.dto.response.EnrichedSurveyResponseDto;
import com.pulse.survey.security.UserPrincipal;
import com.pulse.survey.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/surveys/{id}/org")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AnalyticsOverviewDto> orgAnalytics(@PathVariable UUID id) {
        return ResponseEntity.ok(analyticsService.getOrgAnalytics(id));
    }

    @GetMapping("/surveys/{id}/bu/{buId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BU_HEAD')")
    public ResponseEntity<AnalyticsOverviewDto> buAnalytics(@PathVariable UUID id,
                                                              @PathVariable UUID buId,
                                                              @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(analyticsService.getBUAnalytics(id, buId, principal));
    }

    @GetMapping("/surveys/{id}/competency/{competency}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AnalyticsOverviewDto> competencyAnalytics(@PathVariable UUID id,
                                                                      @PathVariable String competency) {
        return ResponseEntity.ok(analyticsService.getCompetencyAnalytics(id, competency));
    }

    @GetMapping("/surveys/{id}/hrbp/direct")
    @PreAuthorize("hasAnyRole('ADMIN', 'HRBP')")
    public ResponseEntity<AnalyticsOverviewDto> hrbpDirectAnalytics(@PathVariable UUID id,
                                                                      @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(analyticsService.getHrbpDirectAnalytics(id, principal.getId()));
    }

    @GetMapping("/surveys/{id}/hrbp/hierarchy")
    @PreAuthorize("hasAnyRole('ADMIN', 'HRBP')")
    public ResponseEntity<AnalyticsOverviewDto> hrbpHierarchyAnalytics(@PathVariable UUID id,
                                                                         @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(analyticsService.getHrbpHierarchyAnalytics(id, principal.getId()));
    }

    @GetMapping("/surveys/{id}/org/responses")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EnrichedSurveyResponseDto>> orgResponses(@PathVariable UUID id,
                                                                          @RequestParam(required = false) UUID categoryId,
                                                                          @RequestParam(required = false) UUID questionId) {
        return ResponseEntity.ok(analyticsService.getOrgResponses(id, categoryId, questionId));
    }

    @GetMapping("/surveys/{id}/bu/{buId}/responses")
    @PreAuthorize("hasAnyRole('ADMIN', 'BU_HEAD')")
    public ResponseEntity<List<EnrichedSurveyResponseDto>> buResponses(@PathVariable UUID id,
                                                                         @PathVariable UUID buId,
                                                                         @RequestParam(required = false) UUID categoryId,
                                                                         @RequestParam(required = false) UUID questionId,
                                                                         @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(analyticsService.getBUResponses(id, buId, principal, categoryId, questionId));
    }

    @GetMapping("/surveys/{id}/hrbp/direct/responses")
    @PreAuthorize("hasAnyRole('ADMIN', 'HRBP')")
    public ResponseEntity<List<EnrichedSurveyResponseDto>> hrbpDirectResponses(@PathVariable UUID id,
                                                                                 @RequestParam(required = false) UUID categoryId,
                                                                                 @RequestParam(required = false) UUID questionId,
                                                                                 @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(analyticsService.getHrbpDirectResponses(id, principal.getId(), categoryId, questionId));
    }

    @GetMapping("/surveys/{id}/hrbp/hierarchy/responses")
    @PreAuthorize("hasAnyRole('ADMIN', 'HRBP')")
    public ResponseEntity<List<EnrichedSurveyResponseDto>> hrbpHierarchyResponses(@PathVariable UUID id,
                                                                                      @RequestParam(required = false) UUID categoryId,
                                                                                      @RequestParam(required = false) UUID questionId,
                                                                                      @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(analyticsService.getHrbpHierarchyResponses(id, principal.getId(), categoryId, questionId));
    }

    @GetMapping("/surveys/{id}/org/answers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AnalyticsAnswerDetailDto>> orgAnswerDetails(@PathVariable UUID id,
                                                                             @RequestParam(required = false) UUID categoryId,
                                                                             @RequestParam(required = false) UUID questionId) {
        return ResponseEntity.ok(analyticsService.getOrgAnswerDetails(id, categoryId, questionId));
    }

    @GetMapping("/surveys/{id}/bu/{buId}/answers")
    @PreAuthorize("hasAnyRole('ADMIN', 'BU_HEAD')")
    public ResponseEntity<List<AnalyticsAnswerDetailDto>> buAnswerDetails(@PathVariable UUID id,
                                                                            @PathVariable UUID buId,
                                                                            @RequestParam(required = false) UUID categoryId,
                                                                            @RequestParam(required = false) UUID questionId,
                                                                            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(analyticsService.getBUAnswerDetails(id, buId, principal, categoryId, questionId));
    }

    @GetMapping("/surveys/{id}/hrbp/direct/answers")
    @PreAuthorize("hasAnyRole('ADMIN', 'HRBP')")
    public ResponseEntity<List<AnalyticsAnswerDetailDto>> hrbpDirectAnswerDetails(@PathVariable UUID id,
                                                                                      @RequestParam(required = false) UUID categoryId,
                                                                                      @RequestParam(required = false) UUID questionId,
                                                                                      @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(analyticsService.getHrbpDirectAnswerDetails(id, principal.getId(), categoryId, questionId));
    }

    @GetMapping("/surveys/{id}/hrbp/hierarchy/answers")
    @PreAuthorize("hasAnyRole('ADMIN', 'HRBP')")
    public ResponseEntity<List<AnalyticsAnswerDetailDto>> hrbpHierarchyAnswerDetails(@PathVariable UUID id,
                                                                                       @RequestParam(required = false) UUID categoryId,
                                                                                       @RequestParam(required = false) UUID questionId,
                                                                                       @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(analyticsService.getHrbpHierarchyAnswerDetails(id, principal.getId(), categoryId, questionId));
    }
}
