-- =====================================================
-- Migration 01: Update Existing Tables (MySQL Version - FIXED)
-- Purpose: Add missing columns to existing tables
-- Run this FIRST before other migrations
-- =====================================================

-- Helper: Check and add columns safely
-- MySQL doesn't support IF NOT EXISTS in ALTER TABLE
-- So we'll use a different approach

-- 1. Update Projects Table
-- Add columns one by one, ignore errors if they exist
ALTER TABLE projects ADD COLUMN currentStage VARCHAR(50) DEFAULT 'ui_ux';
ALTER TABLE projects ADD COLUMN actualEndDate DATE;
ALTER TABLE projects ADD COLUMN projectType VARCHAR(100);
ALTER TABLE projects ADD COLUMN category VARCHAR(100);
ALTER TABLE projects ADD COLUMN projectManagerId INT;

-- Add check constraint for currentStage (MySQL 8.0.16+)
ALTER TABLE projects ADD CONSTRAINT chk_currentStage 
  CHECK (currentStage IN ('ui_ux', 'development', 'testing', 'completed'));

-- Add foreign key if not exists
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'projects' 
  AND CONSTRAINT_NAME = 'fk_projects_manager');

SET @sql = IF(@fk_exists = 0, 
  'ALTER TABLE projects ADD CONSTRAINT fk_projects_manager FOREIGN KEY (projectManagerId) REFERENCES users(id) ON DELETE SET NULL',
  'SELECT "FK already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Update Tasks Table
ALTER TABLE tasks ADD COLUMN stageId INT;
ALTER TABLE tasks ADD COLUMN dependencies JSON;
ALTER TABLE tasks ADD COLUMN completionDate TIMESTAMP NULL;
ALTER TABLE tasks ADD COLUMN orderIndex INT DEFAULT 0;

-- 3. Update Users Table
ALTER TABLE users ADD COLUMN fullName VARCHAR(255);
ALTER TABLE users ADD COLUMN profileImage VARCHAR(500);
ALTER TABLE users ADD COLUMN lastLogin TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN department VARCHAR(100);

-- 4. Update Deliverables Table
ALTER TABLE deliverables ADD COLUMN version VARCHAR(50) DEFAULT '1.0';
ALTER TABLE deliverables ADD COLUMN approvalStatus VARCHAR(50) DEFAULT 'pending';
ALTER TABLE deliverables ADD COLUMN approvedBy INT;
ALTER TABLE deliverables ADD COLUMN approvedAt TIMESTAMP NULL;

-- Add check constraint for approvalStatus
ALTER TABLE deliverables ADD CONSTRAINT chk_approvalStatus 
  CHECK (approvalStatus IN ('pending', 'approved', 'rejected', 'revision_requested'));

-- Add foreign key for approvedBy
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'deliverables' 
  AND CONSTRAINT_NAME = 'fk_deliverables_approver');

SET @sql = IF(@fk_exists = 0, 
  'ALTER TABLE deliverables ADD CONSTRAINT fk_deliverables_approver FOREIGN KEY (approvedBy) REFERENCES users(id) ON DELETE SET NULL',
  'SELECT "FK already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. Update Bugs Table
ALTER TABLE bugs ADD COLUMN environment VARCHAR(100);
ALTER TABLE bugs ADD COLUMN browserInfo VARCHAR(255);
ALTER TABLE bugs ADD COLUMN deviceInfo VARCHAR(255);
ALTER TABLE bugs ADD COLUMN screenshotUrl VARCHAR(500);
ALTER TABLE bugs ADD COLUMN resolvedAt TIMESTAMP NULL;
ALTER TABLE bugs ADD COLUMN resolvedBy INT;

-- Add foreign key for resolvedBy
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'bugs' 
  AND CONSTRAINT_NAME = 'fk_bugs_resolver');

SET @sql = IF(@fk_exists = 0, 
  'ALTER TABLE bugs ADD CONSTRAINT fk_bugs_resolver FOREIGN KEY (resolvedBy) REFERENCES users(id) ON DELETE SET NULL',
  'SELECT "FK already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6. Update Test Cases Table
ALTER TABLE test_cases ADD COLUMN executedBy INT;
ALTER TABLE test_cases ADD COLUMN executionDate TIMESTAMP NULL;
ALTER TABLE test_cases ADD COLUMN actualResult TEXT;
ALTER TABLE test_cases ADD COLUMN attachmentUrl VARCHAR(500);

-- Add foreign key for executedBy
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'test_cases' 
  AND CONSTRAINT_NAME = 'fk_testcases_executor');

SET @sql = IF(@fk_exists = 0, 
  'ALTER TABLE test_cases ADD CONSTRAINT fk_testcases_executor FOREIGN KEY (executedBy) REFERENCES users(id) ON DELETE SET NULL',
  'SELECT "FK already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 7. Update Sprints Table
ALTER TABLE sprints ADD COLUMN velocity INT DEFAULT 0;
ALTER TABLE sprints ADD COLUMN completedPoints INT DEFAULT 0;
ALTER TABLE sprints ADD COLUMN totalPoints INT DEFAULT 0;

-- Success message
SELECT 'Migration 01 completed: Existing tables updated successfully!' as message;
