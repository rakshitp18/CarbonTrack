package com.team7.carbontrack.service;

import com.team7.carbontrack.dto.RouteOptionResponse;
import com.team7.carbontrack.dto.RouteOptimizeRequest;
import com.team7.carbontrack.dto.RouteOptimizationResultResponse;
import com.team7.carbontrack.entity.ActivityCategory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class RouteOptimizationService {

    private static final BigDecimal KM_TO_MILES = new BigDecimal("0.621371");
    private static final int SCALE = 4;

    private final EmissionCalculationService emissionCalculationService;

    public RouteOptimizationService(EmissionCalculationService emissionCalculationService) {
        this.emissionCalculationService = emissionCalculationService;
    }

    private record ModeConfig(
            String activityType,
            String modeTitle,
            String icon,
            double speedKmh,
            double distanceMultiplier
    ) {}

    public RouteOptimizationResultResponse optimizeRoute(RouteOptimizeRequest request) {
        BigDecimal baseDistanceKm = determineBaseDistance(request);

        List<ModeConfig> modes = List.of(
                new ModeConfig("WALKING", "Walking / On Foot", "walk", 4.8, 0.95),
                new ModeConfig("BICYCLE", "Bicycle Commute", "bicycle", 16.0, 1.0),
                new ModeConfig("PUBLIC_TRANSIT_RAIL", "Train / Metro", "train", 48.0, 1.05),
                new ModeConfig("PUBLIC_TRANSIT_BUS", "Public Bus Transit", "bus", 24.0, 1.10),
                new ModeConfig("CAR_ELECTRIC", "Electric Vehicle (EV)", "ev", 38.0, 1.0),
                new ModeConfig("CAR_DIESEL", "Diesel Car", "car", 38.0, 1.0),
                new ModeConfig("CAR_PETROL", "Petrol Car (Standard)", "car", 38.0, 1.0)
        );

        // Find baseline emissions (Petrol Car)
        BigDecimal baselineDistance = baseDistanceKm.setScale(SCALE, RoundingMode.HALF_UP);
        EmissionCalculationService.CalculationResult baselineCalc = emissionCalculationService.calculate(
                ActivityCategory.TRANSPORT, "CAR_PETROL", "KM", baselineDistance
        );
        BigDecimal baselineCo2eKg = baselineCalc.co2eKg();

        List<RouteOptionResponse> rawRoutes = new ArrayList<>();

        for (ModeConfig config : modes) {
            BigDecimal modeDistanceKm = baseDistanceKm
                    .multiply(BigDecimal.valueOf(config.distanceMultiplier()))
                    .setScale(SCALE, RoundingMode.HALF_UP);

            BigDecimal modeDistanceMiles = modeDistanceKm
                    .multiply(KM_TO_MILES)
                    .setScale(SCALE, RoundingMode.HALF_UP);

            int durationMins = Math.max(1, (int) Math.round((modeDistanceKm.doubleValue() / config.speedKmh()) * 60.0));

            BigDecimal co2eKg;
            try {
                EmissionCalculationService.CalculationResult calc = emissionCalculationService.calculate(
                        ActivityCategory.TRANSPORT, config.activityType(), "KM", modeDistanceKm
                );
                co2eKg = calc.co2eKg();
            } catch (Exception e) {
                co2eKg = BigDecimal.ZERO;
            }

            BigDecimal savingsKg = baselineCo2eKg.subtract(co2eKg).max(BigDecimal.ZERO)
                    .setScale(SCALE, RoundingMode.HALF_UP);

            BigDecimal savingsPct = BigDecimal.ZERO;
            if (baselineCo2eKg.compareTo(BigDecimal.ZERO) > 0) {
                savingsPct = savingsKg.divide(baselineCo2eKg, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(1, RoundingMode.HALF_UP);
            }

            String ecoScore;
            if (co2eKg.compareTo(BigDecimal.ZERO) == 0) {
                ecoScore = "ZERO_EMISSION";
            } else if (co2eKg.compareTo(new BigDecimal("0.5")) < 0) {
                ecoScore = "LOW_EMISSION";
            } else if (co2eKg.compareTo(new BigDecimal("1.5")) < 0) {
                ecoScore = "MODERATE_EMISSION";
            } else {
                ecoScore = "HIGH_EMISSION";
            }

            rawRoutes.add(new RouteOptionResponse(
                    config.activityType(),
                    config.modeTitle(),
                    config.icon(),
                    modeDistanceKm,
                    modeDistanceMiles,
                    durationMins,
                    co2eKg,
                    savingsKg,
                    savingsPct,
                    ecoScore,
                    new ArrayList<>(),
                    false
            ));
        }

        // Find min CO2e, min Distance, min Duration
        RouteOptionResponse minCo2eRoute = rawRoutes.stream()
                .min(Comparator.comparing(RouteOptionResponse::co2eKg))
                .orElse(rawRoutes.get(0));

        RouteOptionResponse minDistanceRoute = rawRoutes.stream()
                .min(Comparator.comparing(RouteOptionResponse::distanceKm))
                .orElse(rawRoutes.get(0));

        RouteOptionResponse minDurationRoute = rawRoutes.stream()
                .min(Comparator.comparing(RouteOptionResponse::durationMinutes))
                .orElse(rawRoutes.get(0));

        List<RouteOptionResponse> finalRoutes = new ArrayList<>();

        for (RouteOptionResponse r : rawRoutes) {
            List<String> tags = new ArrayList<>();
            boolean isRecommended = false;

            if (r.co2eKg().compareTo(minCo2eRoute.co2eKg()) == 0) {
                tags.add("MOST_CARBON_EFFICIENT");
                isRecommended = true;
            }

            if (r.distanceKm().compareTo(minDistanceRoute.distanceKm()) == 0) {
                tags.add("SHORTEST_DISTANCE");
            }

            if (r.durationMinutes().equals(minDurationRoute.durationMinutes())) {
                tags.add("FASTEST_ROUTE");
            }

            if ("CAR_ELECTRIC".equals(r.activityType()) || "PUBLIC_TRANSIT_RAIL".equals(r.activityType())) {
                if (!isRecommended && baseDistanceKm.doubleValue() > 3.0) {
                    isRecommended = true;
                }
            }

            finalRoutes.add(new RouteOptionResponse(
                    r.activityType(),
                    r.modeTitle(),
                    r.icon(),
                    r.distanceKm(),
                    r.distanceMiles(),
                    r.durationMinutes(),
                    r.co2eKg(),
                    r.co2eSavingsVsBaselineKg(),
                    r.savingsPercentage(),
                    r.ecoScore(),
                    tags,
                    isRecommended
            ));
        }

        BigDecimal maxSavingsKg = baselineCo2eKg.subtract(minCo2eRoute.co2eKg()).max(BigDecimal.ZERO);

        String advice;
        if (baseDistanceKm.doubleValue() <= 3.0) {
            advice = "Walking or cycling is 100% zero-emission and the absolute greenest choice for this trip! You will save " 
                    + maxSavingsKg.setScale(2, RoundingMode.HALF_UP) + " kg CO₂e compared to driving.";
        } else if (baseDistanceKm.doubleValue() <= 15.0) {
            advice = "Taking the train or cycling avoids petrol emissions. Opting for public rail or EV saves up to " 
                    + maxSavingsKg.setScale(2, RoundingMode.HALF_UP) + " kg CO₂e for this commute!";
        } else {
            advice = "For long distances, taking public rail transit or driving an Electric Vehicle offers the lowest carbon intensity per kilometer.";
        }

        return new RouteOptimizationResultResponse(
                request.origin(),
                request.destination(),
                finalRoutes.size(),
                minCo2eRoute.activityType(),
                minDistanceRoute.activityType(),
                minDurationRoute.activityType(),
                maxSavingsKg.setScale(2, RoundingMode.HALF_UP),
                advice,
                finalRoutes
        );
    }

    private BigDecimal determineBaseDistance(RouteOptimizeRequest request) {
        if (request.distanceKm() != null && request.distanceKm().compareTo(BigDecimal.ZERO) > 0) {
            return request.distanceKm();
        }

        if (request.originLat() != null && request.originLng() != null 
                && request.destLat() != null && request.destLng() != null) {
            double distance = haversine(
                    request.originLat(), request.originLng(),
                    request.destLat(), request.destLng()
            );
            return BigDecimal.valueOf(Math.max(0.5, distance)).setScale(2, RoundingMode.HALF_UP);
        }

        // Fallback default distance based on origin/dest string length hash
        int seed = Math.abs((request.origin() + request.destination()).hashCode());
        double pseudoDistance = 4.0 + (seed % 140) / 10.0; // 4.0 to 18.0 km
        return BigDecimal.valueOf(pseudoDistance).setScale(2, RoundingMode.HALF_UP);
    }

    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
