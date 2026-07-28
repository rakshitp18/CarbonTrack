package com.team7.carbontrack.dto;

import java.math.BigDecimal;
import java.util.List;

public record RouteOptimizationResultResponse(
        String origin,
        String destination,
        Integer totalOptionsCount,
        String mostCarbonEfficientMode,
        String shortestMode,
        String fastestMode,
        BigDecimal maxCarbonSavingsKg,
        String recommendationAdvice,
        List<RouteOptionResponse> routes
) {}
