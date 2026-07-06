package com.team7.carbontrack.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record DashboardSummary(
    BigDecimal todayCo2e,
    BigDecimal weeklyCo2e,
    BigDecimal monthlyCo2e,
    List<CategoryEmission> categoryBreakdown,
    List<DailyEmission> thisWeekTrend,
    List<DailyEmission> lastWeekTrend,
    List<ActivityLogResponse> recentActivities,
    List<String> recommendations,
    Double percentileRank,
    Map<String, BigDecimal> categoryAverages,
    ActiveGoalProgress activeGoal
) {
    public record ActiveGoalProgress(
        Long id,
        BigDecimal targetReductionPct,
        Integer periodDays,
        java.time.LocalDate startDate,
        BigDecimal baselineCo2e,
        BigDecimal targetCo2e,
        BigDecimal currentCo2e,
        BigDecimal progressPct,
        String trajectoryStatus, // "ON_TRACK", "OFF_TRACK"
        String alertMessage
    ) {}
}
