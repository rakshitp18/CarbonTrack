package com.team7.carbontrack.controller;

import com.team7.carbontrack.dto.RouteOptimizeRequest;
import com.team7.carbontrack.dto.RouteOptimizationResultResponse;
import com.team7.carbontrack.service.RouteOptimizationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/routes")
public class RouteOptimizationController {

    private final RouteOptimizationService routeOptimizationService;

    public RouteOptimizationController(RouteOptimizationService routeOptimizationService) {
        this.routeOptimizationService = routeOptimizationService;
    }

    @PostMapping("/optimize")
    public ResponseEntity<RouteOptimizationResultResponse> optimizeRoute(
            @Valid @RequestBody RouteOptimizeRequest request) {
        RouteOptimizationResultResponse result = routeOptimizationService.optimizeRoute(request);
        return ResponseEntity.ok(result);
    }
}
