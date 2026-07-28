package com.team7.carbontrack.dto;

import java.math.BigDecimal;
import java.util.List;

public record RouteOptionResponse(
        String activityType,
        String modeTitle,
        String icon,
        BigDecimal distanceKm,
        BigDecimal distanceMiles,
        Integer durationMinutes,
        BigDecimal co2eKg,
        BigDecimal co2eSavingsVsBaselineKg,
        BigDecimal savingsPercentage,
        String ecoScore,
        List<String> tags,
        Boolean isRecommended
) {}
