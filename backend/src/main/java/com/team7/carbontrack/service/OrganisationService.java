package com.team7.carbontrack.service;

import com.team7.carbontrack.dto.CategoryEmission;
import com.team7.carbontrack.dto.DashboardSummary;
import com.team7.carbontrack.dto.OrganisationDashboardSummary;
import com.team7.carbontrack.entity.ActivityCategory;
import com.team7.carbontrack.entity.ActivityLog;
import com.team7.carbontrack.entity.Organisation;
import com.team7.carbontrack.entity.User;
import com.team7.carbontrack.exception.ResourceNotFoundException;
import com.team7.carbontrack.repository.ActivityLogRepository;
import com.team7.carbontrack.repository.OrganisationRepository;
import com.team7.carbontrack.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrganisationService {

    private final OrganisationRepository organisationRepository;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final GoalService goalService;

    public OrganisationService(OrganisationRepository organisationRepository,
                               UserRepository userRepository,
                               ActivityLogRepository activityLogRepository,
                               GoalService goalService) {
        this.organisationRepository = organisationRepository;
        this.userRepository = userRepository;
        this.activityLogRepository = activityLogRepository;
        this.goalService = goalService;
    }

    @Transactional(readOnly = true)
    public OrganisationDashboardSummary getOrganisationDashboard(Long orgId) {
        Organisation org = organisationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organisation not found with ID: " + orgId));

        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysAgo = today.minusDays(29);

        // 1. Team category-wise breakdown over the last 30 days
        List<CategoryEmission> categoryBreakdown = activityLogRepository.getOrganisationEmissionsByCategory(
                orgId, thirtyDaysAgo, today
        );
        Map<ActivityCategory, BigDecimal> breakdownMap = new EnumMap<>(ActivityCategory.class);
        for (ActivityCategory cat : ActivityCategory.values()) {
            breakdownMap.put(cat, BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
        }
        for (CategoryEmission ce : categoryBreakdown) {
            breakdownMap.put(ce.category(), ce.totalCo2e().setScale(2, RoundingMode.HALF_UP));
        }
        List<CategoryEmission> completeBreakdown = breakdownMap.entrySet().stream()
                .map(e -> new CategoryEmission(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        // 2. Current month vs previous month emissions
        LocalDate firstOfThisMonth = today.withDayOfMonth(1);
        LocalDate firstOfLastMonth = today.minusMonths(1).withDayOfMonth(1);
        LocalDate endOfLastMonth = today.minusMonths(1).with(java.time.temporal.TemporalAdjusters.lastDayOfMonth());

        BigDecimal currentMonthEmissions = activityLogRepository.getOrganisationTotalEmissions(
                orgId, firstOfThisMonth, today
        );
        if (currentMonthEmissions == null) {
            currentMonthEmissions = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        } else {
            currentMonthEmissions = currentMonthEmissions.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal previousMonthEmissions = activityLogRepository.getOrganisationTotalEmissions(
                orgId, firstOfLastMonth, endOfLastMonth
        );
        if (previousMonthEmissions == null) {
            previousMonthEmissions = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        } else {
            previousMonthEmissions = previousMonthEmissions.setScale(2, RoundingMode.HALF_UP);
        }

        // 3. Employee CSR comparison table list
        List<User> employees = userRepository.findByOrgId(orgId);
        List<OrganisationDashboardSummary.EmployeeComparison> employeeList = new ArrayList<>();

        for (User emp : employees) {
            // Sum of emissions over last 30 days
            BigDecimal totalCo2e = activityLogRepository.findByUserIdAndLogDateBetween(emp.getId(), thirtyDaysAgo, today)
                    .stream()
                    .map(ActivityLog::getCo2eKg)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .setScale(2, RoundingMode.HALF_UP);

            // Active goal status
            DashboardSummary.ActiveGoalProgress goalProgress = goalService.getActiveGoalProgress(emp.getId());
            String activeGoalStatus = goalProgress == null ? "NO_ACTIVE_GOAL" : goalProgress.trajectoryStatus();

            // Last logged date
            List<ActivityLog> lastLogs = activityLogRepository.findByUserIdOrderByLogDateDesc(
                    emp.getId(), PageRequest.of(0, 1)
            ).getContent();
            String lastLogDate = lastLogs.isEmpty() ? "Never" : lastLogs.get(0).getLogDate().toString();

            employeeList.add(new OrganisationDashboardSummary.EmployeeComparison(
                    emp.getId(),
                    emp.getUsername(),
                    totalCo2e,
                    activeGoalStatus,
                    lastLogDate
            ));
        }

        return new OrganisationDashboardSummary(
                org.getName(),
                completeBreakdown,
                currentMonthEmissions,
                previousMonthEmissions,
                employeeList
        );
    }
}
