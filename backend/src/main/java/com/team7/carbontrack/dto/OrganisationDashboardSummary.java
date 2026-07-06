package com.team7.carbontrack.dto;

import java.math.BigDecimal;
import java.util.List;

public record OrganisationDashboardSummary(
    String organisationName,
    List<CategoryEmission> categoryBreakdown,
    BigDecimal currentMonthEmissions,
    BigDecimal previousMonthEmissions,
    List<EmployeeComparison> employees
) {
    public record EmployeeComparison(
        Long id,
        String username,
        BigDecimal totalCo2e,
        String activeGoalStatus, // "ON_TRACK", "OFF_TRACK", "NO_ACTIVE_GOAL"
        String lastLogDate
    ) {}
}
