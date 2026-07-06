package com.team7.carbontrack.service;

import com.team7.carbontrack.entity.ActivityCategory;
import com.team7.carbontrack.entity.EmissionFactor;
import com.team7.carbontrack.exception.EmissionFactorNotFoundException;
import com.team7.carbontrack.repository.EmissionFactorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

/**
 * Unit tests for the emission calculation engine -- Milestone 1's core deliverable.
 * The repository is mocked so these tests run in milliseconds with no real database,
 * and so we can precisely control which emission factor "exists" for each case.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("EmissionCalculationService")
class EmissionCalculationServiceTest {

    @Mock
    private EmissionFactorRepository emissionFactorRepository;

    @InjectMocks
    private EmissionCalculationService emissionCalculationService;

    private EmissionFactor carPetrolFactor;

    @BeforeEach
    void setUp() {
        carPetrolFactor = EmissionFactor.builder()
                .id(1L)
                .category(ActivityCategory.TRANSPORT)
                .activityType("CAR_PETROL")
                .unit("KM")
                .kgCo2ePerUnit(new BigDecimal("0.192000"))
                .source("EPA 2024")
                .effectiveDate(LocalDate.of(2024, 1, 1))
                .active(true)
                .build();
    }

    @Test
    @DisplayName("computes co2e = quantity x factor for a normal case")
    void calculatesNormalCase() {
        when(emissionFactorRepository.findFirstByCategoryAndActivityTypeAndUnitAndActiveTrueOrderByEffectiveDateDesc(
                ActivityCategory.TRANSPORT, "CAR_PETROL", "KM")).thenReturn(Optional.of(carPetrolFactor));

        var result = emissionCalculationService.calculate(
                ActivityCategory.TRANSPORT, "CAR_PETROL", "KM", new BigDecimal("10"));

        // 10 km * 0.192 kg/km = 1.92 kg
        assertThat(result.co2eKg()).isEqualByComparingTo("1.920000");
        assertThat(result.factorUsed().getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("boundary: zero quantity produces zero emissions, not an error")
    void zeroQuantityProducesZero() {
        when(emissionFactorRepository.findFirstByCategoryAndActivityTypeAndUnitAndActiveTrueOrderByEffectiveDateDesc(
                ActivityCategory.TRANSPORT, "CAR_PETROL", "KM")).thenReturn(Optional.of(carPetrolFactor));

        var result = emissionCalculationService.calculate(
                ActivityCategory.TRANSPORT, "CAR_PETROL", "KM", BigDecimal.ZERO);

        assertThat(result.co2eKg()).isEqualByComparingTo("0.000000");
    }

    @Test
    @DisplayName("boundary: a very large quantity still scales linearly without overflow/rounding surprises")
    void maximumQuantityScalesCorrectly() {
        when(emissionFactorRepository.findFirstByCategoryAndActivityTypeAndUnitAndActiveTrueOrderByEffectiveDateDesc(
                ActivityCategory.TRANSPORT, "CAR_PETROL", "KM")).thenReturn(Optional.of(carPetrolFactor));

        // 1,000,000 km is the max quantity allowed by ActivityLogRequest's @DecimalMax.
        var result = emissionCalculationService.calculate(
                ActivityCategory.TRANSPORT, "CAR_PETROL", "KM", new BigDecimal("1000000"));

        assertThat(result.co2eKg()).isEqualByComparingTo("192000.000000");
    }

    @Test
    @DisplayName("boundary: unknown activity type throws EmissionFactorNotFoundException, never silently guesses")
    void unknownActivityTypeThrows() {
        when(emissionFactorRepository.findFirstByCategoryAndActivityTypeAndUnitAndActiveTrueOrderByEffectiveDateDesc(
                ActivityCategory.TRANSPORT, "HOVERBOARD", "KM")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> emissionCalculationService.calculate(
                ActivityCategory.TRANSPORT, "HOVERBOARD", "KM", new BigDecimal("5")))
                .isInstanceOf(EmissionFactorNotFoundException.class)
                .hasMessageContaining("HOVERBOARD");
    }

    /**
     * Parameterised test: verifies the calculation engine against a table of known
     * (quantity, factor, expected co2e) triples in a few lines, covering all four
     * categories without writing a near-identical method for each one.
     */
    @ParameterizedTest(name = "{0} {1} of {2} at {3} kg/unit = {4} kg CO2e")
    @DisplayName("parameterised: calculation is correct across categories and known factors")
    @CsvSource({
            // quantity, activityType,        unit,     factorPerUnit, expectedCo2eKg
            "10,        CAR_PETROL,           KM,       0.192000,      1.920000",
            "100,       CAR_ELECTRIC,         KM,       0.053000,      5.300000",
            "50,        GRID_ELECTRICITY,     KWH,      0.475000,      23.750000",
            "1,         BEEF_MEAL,            SERVING,  6.610000,      6.610000",
            "3,         VEGAN_MEAL,           SERVING,  0.520000,      1.560000",
            "200,       CLOTHING,             USD,      0.400000,      80.000000"
    })
    void calculatesAcrossKnownFactorTable(String quantityStr, String activityType, String unit,
                                           String factorStr, String expectedCo2eStr) {
        EmissionFactor factor = EmissionFactor.builder()
                .id(99L)
                .activityType(activityType)
                .unit(unit)
                .kgCo2ePerUnit(new BigDecimal(factorStr))
                .active(true)
                .build();

        when(emissionFactorRepository.findFirstByCategoryAndActivityTypeAndUnitAndActiveTrueOrderByEffectiveDateDesc(
                any(), anyString(), anyString())).thenReturn(Optional.of(factor));

        var result = emissionCalculationService.calculate(
                ActivityCategory.TRANSPORT, activityType, unit, new BigDecimal(quantityStr));

        assertThat(result.co2eKg()).isEqualByComparingTo(expectedCo2eStr);
    }
}
