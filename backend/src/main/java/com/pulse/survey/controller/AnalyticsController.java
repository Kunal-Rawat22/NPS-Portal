package com.pulse.survey.controller;

import com.pulse.survey.dto.response.AnalyticsOverviewDto;
import com.pulse.survey.security.UserPrincipal;
import com.pulse.survey.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<AnalyticsOverviewDto> buAnalytics(@PathVariable UUID id, @PathVariable UUID buId) {
        return ResponseEntity.ok(analyticsService.getBUAnalytics(id, buId));
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
}
