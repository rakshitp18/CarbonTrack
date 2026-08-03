ALTER TABLE organisations ADD COLUMN join_code VARCHAR(12);
UPDATE organisations SET join_code = 'ORG' || id WHERE join_code IS NULL;
ALTER TABLE organisations ALTER COLUMN join_code SET NOT NULL;
ALTER TABLE organisations ADD CONSTRAINT uq_organisations_join_code UNIQUE (join_code);

ALTER TABLE users ADD COLUMN employee_id VARCHAR(50);
ALTER TABLE users ADD COLUMN department VARCHAR(100);
ALTER TABLE users ADD COLUMN designation VARCHAR(100);
CREATE UNIQUE INDEX uq_users_org_employee_id ON users(org_id, employee_id);
