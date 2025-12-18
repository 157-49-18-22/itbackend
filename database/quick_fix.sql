-- ============================================
-- QUICK FIX FOR DEVELOPER TABLES
-- Database: it_agency_pms
-- ============================================

USE it_agency_pms;

-- ============================================
-- STEP 1: Check what columns exist
-- ============================================

-- Check SPRINTS table structure
SELECT COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'it_agency_pms' 
AND TABLE_NAME = 'sprints'
ORDER BY ORDINAL_POSITION;

-- Check TASKS table structure
SELECT COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'it_agency_pms' 
AND TABLE_NAME = 'tasks'
ORDER BY ORDINAL_POSITION;

-- ============================================
-- STEP 2: Add missing columns (safe - won't error if exists)
-- ============================================

-- Add to SPRINTS if missing
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = 'it_agency_pms' 
   AND TABLE_NAME = 'sprints' 
   AND COLUMN_NAME = 'goal') = 0,
  'ALTER TABLE sprints ADD COLUMN goal TEXT AFTER name',
  'SELECT "Column goal already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add velocity
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = 'it_agency_pms' 
   AND TABLE_NAME = 'sprints' 
   AND COLUMN_NAME = 'velocity') = 0,
  'ALTER TABLE sprints ADD COLUMN velocity INT DEFAULT 20',
  'SELECT "Column velocity already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add total_points
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = 'it_agency_pms' 
   AND TABLE_NAME = 'sprints' 
   AND COLUMN_NAME = 'total_points') = 0,
  'ALTER TABLE sprints ADD COLUMN total_points INT DEFAULT 0',
  'SELECT "Column total_points already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add completed_points
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = 'it_agency_pms' 
   AND TABLE_NAME = 'sprints' 
   AND COLUMN_NAME = 'completed_points') = 0,
  'ALTER TABLE sprints ADD COLUMN completed_points INT DEFAULT 0',
  'SELECT "Column completed_points already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- STEP 3: Insert sample data (safe)
-- ============================================

-- Clear existing sample data (optional)
-- DELETE FROM sprints WHERE name LIKE 'Sprint%';
-- DELETE FROM bugs WHERE title LIKE '%button%' OR title LIKE '%Dashboard%';

-- Insert sample sprints
INSERT IGNORE INTO sprints (id, name, start_date, end_date, status, project_id) VALUES
(100, 'Sprint 1 - Setup & Frontend', '2025-01-01', '2025-01-14', 'active', 1),
(101, 'Sprint 2 - Backend & Integration', '2025-01-15', '2025-01-28', 'planning', 1);

-- Insert sample bugs
INSERT IGNORE INTO bugs (id, title, description, severity, status, reported_by, assigned_to, project_id) VALUES
(100, 'Login button not responding', 'The login button does not respond to clicks on mobile devices', 'high', 'open', 1, 2, 1),
(101, 'Dashboard loading slow', 'Dashboard takes more than 5 seconds to load', 'medium', 'in progress', 1, 2, 1),
(102, 'API timeout error', 'API calls timing out after 30 seconds', 'critical', 'open', 1, 2, 1);

-- ============================================
-- STEP 4: Verify everything
-- ============================================

SELECT 'SPRINTS TABLE:' as info;
SELECT * FROM sprints WHERE id >= 100;

SELECT 'BUGS TABLE:' as info;
SELECT id, title, severity, status FROM bugs WHERE id >= 100;

SELECT 'TIME LOGS:' as info;
SELECT * FROM time_logs ORDER BY log_id DESC LIMIT 5;

-- ============================================
-- DONE!
-- ============================================
SELECT '✅ Setup complete!' as status;
