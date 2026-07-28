package com.team7.carbontrack.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public record RouteOptimizeRequest(
        @NotBlank(message = "Origin location is required")
        String origin,

        @NotBlank(message = "Destination location is required")
        String destination,

        Double originLat,
        Double originLng,
        Double destLat,
        Double destLng,
        BigDecimal distanceKm
) {}
