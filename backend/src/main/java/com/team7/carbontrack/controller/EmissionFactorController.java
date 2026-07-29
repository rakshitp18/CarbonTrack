package com.team7.carbontrack.controller;

import com.team7.carbontrack.dto.EmissionFactorResponse;
import com.team7.carbontrack.repository.EmissionFactorRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/emission-factors")
public class EmissionFactorController {
    private final EmissionFactorRepository emissionFactorRepository;

    public EmissionFactorController(EmissionFactorRepository emissionFactorRepository) {
        this.emissionFactorRepository = emissionFactorRepository;
    }

    @GetMapping
    public ResponseEntity<List<EmissionFactorResponse>> getActiveFactors() {
        return ResponseEntity.ok(emissionFactorRepository.findByActiveTrue().stream()
                .map(EmissionFactorResponse::from)
                .toList());
    }
}
