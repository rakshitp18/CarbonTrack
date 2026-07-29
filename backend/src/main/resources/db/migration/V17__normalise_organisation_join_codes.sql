UPDATE organisations
SET join_code = LPAD(CAST(id AS VARCHAR), 8, '0');
