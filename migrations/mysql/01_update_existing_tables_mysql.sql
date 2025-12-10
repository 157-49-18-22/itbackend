-- =====================================================
-- Migration 01: Update Existing Tables (MySQL Version)
-- Purpose: Add missing columns to existing tables
-- Run this FIRST before other migrations
-- =====================================================

-- 1. Update Projects Table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS currentStage VARCHAR(50) DEFAULT 'ui_ux' 
  CHECK (currentStage IN ('ui_ux', 'development', 'testing', 'completed'));
ALTER TABLE projects ADD COLUMN IF NOT EXISTS actualEndDate DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS projectType VARCHAR(100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS projectManagerId INT;
ALTER TABLE projects ADD CONSTRAINT fk_projects_manager 
  FOREIGN KEY (projectManagerId) REFERENCES users(id) ON DELETE SET NULL;

-- 2. Update Tasks Table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS stageId INT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS dependencies JSON;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completionDate TIMESTAMP;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS orderIndex INT DEFAULT 0;

-- 3. Update Users Table
ALTER TABLE users ADD COLUMN IF NOT EXISTS fullName VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profileImage VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS lastLogin TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);

-- 4. Update Deliverables Table (if exists)
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS version VARCHAR(50) DEFAULT '1.0';
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS approvalStatus VARCHAR(50) DEFAULT 'pending' 
  CHECK (approvalStatus IN ('pending', 'approved', 'rejected', 'revision_requested'));
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS approvedBy INT;
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS approvedAt TIMESTAMP;
ALTER TABLE deliverables ADD CONSTRAINT fk_deliverables_approver 
  FOREIGN KEY (approvedBy) REFERENCES users(id) ON DELETE SET NULL;

-- 5. Update Bugs Table
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS environment VARCHAR(100);
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS browserInfo VARCHAR(255);
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS deviceInfo VARCHAR(255);
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS screenshotUrl VARCHAR(500);
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS resolvedAt TIMESTAMP;
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS resolvedBy INT;
ALTER TABLE bugs ADD CONSTRAINT fk_bugs_resolver 
  FOREIGN KEY (resolvedBy) REFERENCES users(id) ON DELETE SET NULL;

-- 6. Update Test Cases Table
ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS executedBy INT;
ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS executionDate TIMESTAMP;
ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS actualResult TEXT;
ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS attachmentUrl VARCHAR(500);
ALTER TABLE test_cases ADD CONSTRAINT fk_testcases_executor 
  FOREIGN KEY (executedBy) REFERENCES users(id) ON DELETE SET NULL;

-- 7. Update Sprints Table (if exists)
ALTER TABLE sprints ADD COLUMN IF NOT EXISTS velocity INT DEFAULT 0;
ALTER TABLE sprints ADD COLUMN IF NOT EXISTS completedPoints INT DEFAULT 0;
ALTER TABLE sprints ADD COLUMN IF NOT EXISTS totalPoints INT DEFAULT 0;

-- Success message
SELECT 'Migration 01 completed: Existing tables updated successfully!' as message;
