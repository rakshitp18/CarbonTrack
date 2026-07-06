package com.team7.carbontrack.controller;

import com.team7.carbontrack.dto.DashboardSummary;
import com.team7.carbontrack.dto.GoalRequest;
import com.team7.carbontrack.entity.Goal;
import com.team7.carbontrack.security.UserPrincipal;
import com.team7.carbontrack.service.GoalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/goals")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @PostMapping
    public ResponseEntity<Goal> createGoal(@AuthenticationPrincipal UserPrincipal principal,
                                           @Valid @RequestBody GoalRequest request) {
        Goal goal = goalService.createGoal(principal.getId(), request.targetReductionPct(), request.periodDays());
        return ResponseEntity.status(HttpStatus.CREATED).body(goal);
    }

    @GetMapping
    public ResponseEntity<List<Goal>> getGoals(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(goalService.getGoals(principal.getId()));
    }

    @GetMapping("/active")
    public ResponseEntity<DashboardSummary.ActiveGoalProgress> getActiveGoal(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(goalService.getActiveGoalProgress(principal.getId()));
    }
}
