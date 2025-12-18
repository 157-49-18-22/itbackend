-- ============================================
-- FINAL FIX - Check actual column names
-- Database: it_agency_pms
-- ============================================

USE it_agency_pms;

-- ============================================
-- STEP 1: Check actual column names in sprints
-- ============================================
SELECT COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'it_agency_pms' 
AND TABLE_NAME = 'sprints'
ORDER BY ORDINAL_POSITION;

-- ============================================
-- STEP 2: Check actual column names in tasks
-- ============================================
SELECT COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'it_agency_pms' 
AND TABLE_NAME = 'tasks'
ORDER BY ORDINAL_POSITION;

-- ============================================
-- STEP 3: Insert sample data with correct column names
-- ============================================

-- For sprints - use actual column names from your table
-- Common variations: startDate/start_date, endDate/end_date, projectId/project_id

-- Try this (adjust based on STEP 1 output):
INSERT IGNORE INTO sprints (id, name, goal, status, velocity, total_points, completed_points) VALUES
(100, 'Sprint 1 - Setup & Frontend', 'Complete environment setup and basic frontend components', 'active', 25, 50, 20),
(101, 'Sprint 2 - Backend & Integration', 'Develop backend APIs and integrate with frontend', 'planning', 30, 60, 0);

-- ============================================
-- STEP 4: Verify
-- ============================================

SELECT 'SPRINTS:' as info;
SELECT * FROM sprints;

SELECT 'BUGS:' as info;
SELECT id, title, severity, status FROM bugs ORDER BY id DESC LIMIT 5;

SELECT 'TASKS:' as info;
SELECT * FROM tasks LIMIT 5;

-- ============================================
-- DONE!
-- ============================================
