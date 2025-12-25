-- Check latest deliverables
SELECT id, name, phase, status, type, projectId FROM deliverables ORDER BY id DESC LIMIT 5;
