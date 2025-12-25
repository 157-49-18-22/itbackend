-- Check status column definition
SHOW COLUMNS FROM deliverables LIKE 'status';

-- List all deliverables to see existing status values
SELECT id, status FROM deliverables LIMIT 10;
