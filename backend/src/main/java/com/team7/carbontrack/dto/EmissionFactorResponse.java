package com.team7.carbontrack.dto;

import com.team7.carbontrack.entity.EmissionFactor;
import java.math.BigDecimal;

/** Safe client-facing view of the active factor table. */
public record EmissionFactorResponse(String category, String activityType, String unit, BigDecimal factor) {
    public static EmissionFactorResponse from(EmissionFactor factor) {
        return new EmissionFactorResponse(
                factor.getCategory().name(), factor.getActivityType(), factor.getUnit(), factor.getKgCo2ePerUnit());
    }
}
