package com.pulse.survey.service;

import com.pulse.survey.dto.response.AnalyticsOverviewDto;
import com.pulse.survey.dto.response.CategoryScoreDto;
import com.pulse.survey.entity.QuestionResponse;
import com.pulse.survey.entity.User;
import com.pulse.survey.enums.ResponseStatus;
import com.pulse.survey.repository.QuestionResponseRepository;
import com.pulse.survey.repository.SurveyResponseRepository;
import com.pulse.survey.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final QuestionResponseRepository questionResponseRepo;
    private final SurveyResponseRepository surveyResponseRepo;
    private final UserRepository userRepository;
    private final SurveyService surveyService;

    @Cacheable(value = "analytics", key = "'org:' + #surveyId")
    public AnalyticsOverviewDto getOrgAnalytics(UUID surveyId) {
        var survey = surveyService.findSurvey(surveyId);
        List<QuestionResponse> responses = questionResponseRepo.findAllSubmittedBySurveyId(surveyId);
        long total = userRepository.count();
        long completed = surveyResponseRepo.countBySurveyIdAndStatus(surveyId, ResponseStatus.SUBMITTED);
        return buildOverview(surveyId, survey.getTitle(), responses, total, completed);
    }

    @Cacheable(value = "analytics", key = "'bu:' + #surveyId + ':' + #buId")
    public AnalyticsOverviewDto getBUAnalytics(UUID surveyId, UUID buId) {
        var survey = surveyService.findSurvey(surveyId);
        List<User> buUsers = userRepository.findByBusinessUnitId(buId);
        List<UUID> userIds = buUsers.stream().map(User::getId).toList();
        List<QuestionResponse> responses = questionResponseRepo.findBySurveyIdAndUserIds(surveyId, userIds);
        long completed = surveyResponseRepo.countBySurveyIdAndStatus(surveyId, ResponseStatus.SUBMITTED);
        return buildOverview(surveyId, survey.getTitle(), responses, buUsers.size(), completed);
    }

    @Cacheable(value = "analytics", key = "'hrbp:direct:' + #surveyId + ':' + #hrbpId")
    public AnalyticsOverviewDto getHrbpDirectAnalytics(UUID surveyId, UUID hrbpId) {
        var survey = surveyService.findSurvey(surveyId);
        List<User> directReports = userRepository.findByHrbpId(hrbpId);
        List<UUID> userIds = directReports.stream().map(User::getId).toList();
        List<QuestionResponse> responses = questionResponseRepo.findBySurveyIdAndUserIds(surveyId, userIds);
        long completed = responses.stream().map(qr -> qr.getSurveyResponse().getUser().getId()).distinct().count();
        return buildOverview(surveyId, survey.getTitle(), responses, directReports.size(), completed);
    }

    @Cacheable(value = "analytics", key = "'hrbp:hierarchy:' + #surveyId + ':' + #hrbpId")
    public AnalyticsOverviewDto getHrbpHierarchyAnalytics(UUID surveyId, UUID hrbpId) {
        var survey = surveyService.findSurvey(surveyId);
        List<User> hierarchyUsers = new ArrayList<>(userRepository.findAllInHierarchy(hrbpId));
        hierarchyUsers.addAll(userRepository.findByHrbpId(hrbpId));
        List<UUID> userIds = hierarchyUsers.stream().map(User::getId).distinct().toList();
        List<QuestionResponse> responses = questionResponseRepo.findBySurveyIdAndUserIds(surveyId, userIds);
        long completed = responses.stream().map(qr -> qr.getSurveyResponse().getUser().getId()).distinct().count();
        return buildOverview(surveyId, survey.getTitle(), responses, hierarchyUsers.size(), completed);
    }

    @Cacheable(value = "analytics", key = "'competency:' + #surveyId + ':' + #competency")
    public AnalyticsOverviewDto getCompetencyAnalytics(UUID surveyId, String competency) {
        var survey = surveyService.findSurvey(surveyId);
        List<User> users = userRepository.findByCompetency(competency);
        List<UUID> userIds = users.stream().map(User::getId).toList();
        List<QuestionResponse> responses = questionResponseRepo.findBySurveyIdAndUserIds(surveyId, userIds);
        long completed = responses.stream().map(qr -> qr.getSurveyResponse().getUser().getId()).distinct().count();
        return buildOverview(surveyId, survey.getTitle(), responses, users.size(), completed);
    }

    private AnalyticsOverviewDto buildOverview(UUID surveyId, String title,
                                                List<QuestionResponse> responses,
                                                long totalEmployees, long completed) {
        Map<UUID, List<QuestionResponse>> byCategory = responses.stream()
                .collect(Collectors.groupingBy(qr -> qr.getQuestion().getCategory().getId()));

        List<CategoryScoreDto> scores = byCategory.entrySet().stream().map(entry -> {
            var sample = entry.getValue().get(0);
            String catName = sample.getQuestion().getCategory().getName();
            double avg = entry.getValue().stream().mapToInt(QuestionResponse::getRating).average().orElse(0);
            return new CategoryScoreDto(entry.getKey(), catName, Math.round(avg * 100.0) / 100.0,
                    entry.getValue().size(), (long) entry.getValue().size());
        }).sorted(Comparator.comparing(CategoryScoreDto::categoryName)).toList();

        double rate = totalEmployees > 0 ? (double) completed / totalEmployees * 100 : 0;
        return new AnalyticsOverviewDto(surveyId, title, totalEmployees, completed,
                Math.round(rate * 10.0) / 10.0, scores);
    }
}
