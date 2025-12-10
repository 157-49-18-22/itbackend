-- =====================================================
-- VERIFICATION QUERIES
-- Run these to verify all migrations completed successfully
-- =====================================================

-- 1. Check total tables (should be 35+)
SELECT COUNT(*) as total_tables 
FROM information_schema.tables 
WHERE table_schema = 'it_agency_pms' 
AND table_type = 'BASE TABLE';

-- 2. List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'it_agency_pms' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 3. Check new tables created
SELECT 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'it_agency_pms' AND table_name = 'project_stages') 
        THEN '✅' ELSE '❌' END as project_stages,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'it_agency_pms' AND table_name = 'comments') 
        THEN '✅' ELSE '❌' END as comments,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'it_agency_pms' AND table_name = 'audit_trail') 
        THEN '✅' ELSE '❌' END as audit_trail,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'it_agency_pms' AND table_name = 'approvals_new') 
        THEN '✅' ELSE '❌' END as approvals_new,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'it_agency_pms' AND table_name = 'notifications_new') 
        THEN '✅' ELSE '❌' END as notifications_new,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'it_agency_pms' AND table_name = 'messages') 
        THEN '✅' ELSE '❌' END as messages,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'it_agency_pms' AND table_name = 'file_attachments') 
        THEN '✅' ELSE '❌' END as file_attachments;

-- 4. Check project_stages data
SELECT COUNT(*) as total_stages FROM project_stages;

-- 5. Check stages per project (should be 3 per project)
SELECT 
    p.id as project_id,
    p.name as project_name,
    COUNT(ps.id) as stages_count
FROM projects p
LEFT JOIN project_stages ps ON p.id = ps.projectId
GROUP BY p.id, p.name;

-- 6. Check new columns added to existing tables
DESCRIBE projects;
DESCRIBE tasks;
DESCRIBE users;

-- 7. Check indexes created
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'it_agency_pms'
AND INDEX_NAME LIKE 'idx_%'
ORDER BY TABLE_NAME, INDEX_NAME;

-- 8. Check foreign keys
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'it_agency_pms'
AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME;

-- 9. Sample data check
SELECT * FROM project_stages LIMIT 5;
SELECT * FROM comments LIMIT 5;
SELECT * FROM audit_trail LIMIT 5;

-- 10. Final summary
SELECT 
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'it_agency_pms' AND table_type = 'BASE TABLE') as total_tables,
    (SELECT COUNT(*) FROM project_stages) as total_stages,
    (SELECT COUNT(*) FROM projects) as total_projects,
    (SELECT COUNT(*) FROM tasks) as total_tasks,
    (SELECT COUNT(*) FROM users) as total_users;
