INSERT INTO badges (name, description, trigger_type, threshold) VALUES
    ('Green Commuter', 'Log a transportation activity 7 days in a row', 'STREAK', 7.00),
    ('First Step', 'Achieve your first carbon reduction goal', 'GOAL', 1.00),
    ('Carbon Saver 10', 'Reduce your emissions by 10 kg CO2e', 'REDUCTION', 10.00),
    ('Carbon Saver 25', 'Reduce your emissions by 25 kg CO2e', 'REDUCTION', 25.00),
    ('Carbon Saver 50', 'Reduce your emissions by 50 kg CO2e', 'REDUCTION', 50.00)
ON CONFLICT (name) DO NOTHING;
