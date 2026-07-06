package com.team7.carbontrack.dto;

import com.team7.carbontrack.entity.ActivityCategory;
import java.math.BigDecimal;

public record CategoryEmission(ActivityCategory category, BigDecimal totalCo2e) {}
