-- ============================================
-- DEVELOPER PAGE - DATABASE TABLES (CORRECTED)
-- ============================================
-- Database: it_agency_pms
-- Run these queries in MySQL
-- ============================================

USE it_agency_pms;

-- ============================================
-- Check existing table structures first
-- ============================================
-- DESCRIBE sprints;
-- DESCRIBE tasks;
-- DESCRIBE bugs;

-- ============================================
-- FIX: Add missing columns to existing tables
-- ============================================

-- Fix SPRINTS table - add missing columns if they don't exist
ALTER TABLE sprints 
ADD COLUMN IF NOT EXISTS goal TEXT AFTER name,
ADD COLUMN IF NOT EXISTS velocity INT DEFAULT 20 AFTER status,
ADD COLUMN IF NOT EXISTS total_points INT DEFAULT 0 AFTER velocity,
ADD COLUMN IF NOT EXISTS completed_points INT DEFAULT 0 AFTER total_points,
ADD COLUMN IF NOT EXISTS total_tasks INT DEFAULT 0 AFTER completed_points,
ADD COLUMN IF NOT EXISTS completed_tasks INT DEFAULT 0 AFTER total_tasks;

-- Fix TASKS table - add missing columns if they don't exist
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS story_points INT DEFAULT 0 AFTER sprint_id,
ADD COLUMN IF NOT EXISTS dependencies JSON AFTER story_points;

-- Fix BUGS table - ensure all columns exist
-- (Bugs table seems fine based on the output)

-- Fix TASK_CHECKLISTS table - rename columns if needed
-- Check if columns exist with different names
SET @dbname = 'it_agency_pms';
SET @tablename = 'task_checklists';

-- ============================================
-- Create missing indexes (skip if they already exist)
-- ============================================

-- Sprints indexes (only create if columns exist)
CREATE INDEX IF NOT EXISTS idx_sprints_project_id ON sprints(project_id);
CREATE INDEX IF NOT EXISTS idx_sprints_dates ON sprints(start_date, end_date);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_sprint_id ON tasks(sprint_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Deliverables indexes
CREATE INDEX IF NOT EXISTS idx_deliverables_project_id ON deliverables(project_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_uploaded_by ON deliverables(uploaded_by);

-- ============================================
-- SAMPLE DATA FOR TESTING (CORRECTED)
-- ============================================

-- Sample Sprints (with correct column names)
INSERT INTO sprints (name, start_date, end_date, status, project_id) VALUES
('Sprint 1 - Setup & Frontend', '2025-01-01', '2025-01-14', 'active', 1),
('Sprint 2 - Backend & Integration', '2025-01-15', '2025-01-28', 'planning', 1)
ON DUPLICATE KEY UPDATE name=name;

-- Update sprint goals separately
UPDATE sprints SET goal = 'Complete environment setup and basic frontend components' WHERE name = 'Sprint 1 - Setup & Frontend';
UPDATE sprints SET goal = 'Develop backend APIs and integrate with frontend' WHERE name = 'Sprint 2 - Backend & Integration';

-- Sample Bugs (with correct status values)
INSERT INTO bugs (title, description, severity, status, reported_by, assigned_to, project_id) VALUES
('Login button not responding', 'The login button does not respond to clicks on mobile devices', 'high', 'open', 1, 2, 1),
('Dashboard loading slow', 'Dashboard takes more than 5 seconds to load', 'medium', 'in progress', 1, 2, 1),
('API timeout error', 'API calls timing out after 30 seconds', 'critical', 'open', 1, 2, 1)
ON DUPLICATE KEY UPDATE title=title;

-- Sample Tasks (check actual column names first)
-- Get actual column names from tasks table
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'it_agency_pms' AND TABLE_NAME = 'tasks';

-- If task_name exists, use it; if name exists, use that
-- Assuming the table uses standard column names from your schema

-- Sample Task Checklists (check actual column names)
-- Get actual column names
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'it_agency_pms' AND TABLE_NAME = 'task_checklists';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all tables
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'it_agency_pms' 
AND TABLE_NAME IN (
  'bugs', 'sprints', 'tasks', 'task_checklists', 
  'time_logs', 'deliverables', 'bug_comments', 
  'task_comments', 'code_repositories', 'sprint_tasks'
)
ORDER BY TABLE_NAME;

-- Count records
SELECT 
  'bugs' as table_name, COUNT(*) as record_count FROM bugs
UNION ALL
SELECT 'sprints', COUNT(*) FROM sprints
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'task_checklists', COUNT(*) FROM task_checklists
UNION ALL
SELECT 'time_logs', COUNT(*) FROM time_logs
UNION ALL
SELECT 'deliverables', COUNT(*) FROM deliverables;

-- Show table structures
SHOW CREATE TABLE sprints;
SHOW CREATE TABLE tasks;
SHOW CREATE TABLE bugs;
SHOW CREATE TABLE task_checklists;

-- ============================================
-- DONE!
-- ============================================
