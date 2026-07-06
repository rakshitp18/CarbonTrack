package com.team7.carbontrack.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyEmission(LocalDate logDate, BigDecimal totalCo2e) {}
