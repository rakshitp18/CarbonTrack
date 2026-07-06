package com.team7.carbontrack.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record GoalRequest(
    @NotNull(message = "Target reduction percentage is required")
    @DecimalMin(value = "0.01", message = "Target reduction percentage must be greater than 0")
    @DecimalMax(value = "100.00", message = "Target reduction percentage cannot exceed 100")
    BigDecimal targetReductionPct,

    @NotNull(message = "Goal period in days is required")
    @jakarta.validation.constraints.Min(value = 1, message = "Goal period must be at least 1 day")
    Integer periodDays
) {}
