-- V15: Add active zero-emission transport options (WALKING and BICYCLE) for Route Optimizer

INSERT INTO emission_factors (category, activity_type, unit, kg_co2e_per_unit, source, effective_date) VALUES
    ('TRANSPORT', 'WALKING', 'KM', 0.000000, 'ZERO_EMISSION', '2024-01-01'),
    ('TRANSPORT', 'BICYCLE', 'KM', 0.000000, 'ZERO_EMISSION', '2024-01-01');
