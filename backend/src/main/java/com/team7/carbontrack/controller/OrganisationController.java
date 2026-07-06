package com.team7.carbontrack.controller;

import com.team7.carbontrack.dto.OrganisationDashboardSummary;
import com.team7.carbontrack.security.UserPrincipal;
import com.team7.carbontrack.service.OrganisationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/organisations")
public class OrganisationController {
    
    private final OrganisationService organisationService;

    public OrganisationController(OrganisationService organisationService) {
        this.organisationService = organisationService;
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<OrganisationDashboardSummary> getDashboard(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal.getUser().getOrgId() == null) {
            throw new IllegalArgumentException("User does not belong to any organization");
        }
        return ResponseEntity.ok(organisationService.getOrganisationDashboard(principal.getUser().getOrgId()));
    }
}
