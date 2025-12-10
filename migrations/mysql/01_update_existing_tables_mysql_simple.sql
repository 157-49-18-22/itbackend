-- =====================================================
-- Migration 01: Update Existing Tables (MySQL - Simple Version)
-- Purpose: Add missing columns to existing tables
-- Run this FIRST before other migrations
-- NOTE: Ignore "Duplicate column" errors - they're safe
-- =====================================================

-- 1. Update Projects Table
ALTER TABLE projects ADD COLUMN currentStage VARCHAR(50) DEFAULT 'ui_ux';
ALTER TABLE projects ADD COLUMN actualEndDate DATE;
ALTER TABLE projects ADD COLUMN projectType VARCHAR(100);
ALTER TABLE projects ADD COLUMN category VARCHAR(100);
ALTER TABLE projects ADD COLUMN projectManagerId INT;

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

-- 5. Update Bugs Table
ALTER TABLE bugs ADD COLUMN environment VARCHAR(100);
ALTER TABLE bugs ADD COLUMN browserInfo VARCHAR(255);
ALTER TABLE bugs ADD COLUMN deviceInfo VARCHAR(255);
ALTER TABLE bugs ADD COLUMN screenshotUrl VARCHAR(500);
ALTER TABLE bugs ADD COLUMN resolvedAt TIMESTAMP NULL;
ALTER TABLE bugs ADD COLUMN resolvedBy INT;

-- 6. Update Test Cases Table
ALTER TABLE test_cases ADD COLUMN executedBy INT;
ALTER TABLE test_cases ADD COLUMN executionDate TIMESTAMP NULL;
ALTER TABLE test_cases ADD COLUMN actualResult TEXT;
ALTER TABLE test_cases ADD COLUMN attachmentUrl VARCHAR(500);

-- 7. Update Sprints Table
ALTER TABLE sprints ADD COLUMN velocity INT DEFAULT 0;
ALTER TABLE sprints ADD COLUMN completedPoints INT DEFAULT 0;
ALTER TABLE sprints ADD COLUMN totalPoints INT DEFAULT 0;

-- Success message
SELECT 'Migration 01 completed: Existing tables updated successfully!' as message;
SELECT 'Note: Ignore "Duplicate column" errors - columns already exist' as note;
