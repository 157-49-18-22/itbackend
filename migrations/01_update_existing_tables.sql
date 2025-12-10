-- =====================================================
-- Migration 01: Update Existing Tables
-- Purpose: Add missing columns to existing tables
-- Run this FIRST before other migrations
-- =====================================================

-- 1. Update Projects Table
-- Add stage tracking and additional fields
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "currentStage" VARCHAR(50) DEFAULT 'ui_ux' 
  CHECK ("currentStage" IN ('ui_ux', 'development', 'testing', 'completed'));

ALTER TABLE projects ADD COLUMN IF NOT EXISTS "actualEndDate" DATE;

ALTER TABLE projects ADD COLUMN IF NOT EXISTS "projectType" VARCHAR(100);

ALTER TABLE projects ADD COLUMN IF NOT EXISTS "category" VARCHAR(100);

-- Add project manager reference if not exists
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "projectManagerId" INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- 2. Update Tasks Table
-- Add stage reference and dependencies
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS "stageId" INTEGER;

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS "dependencies" JSONB DEFAULT '[]';

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS "completionDate" TIMESTAMP;

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS "orderIndex" INTEGER DEFAULT 0;

-- 3. Update Users Table
-- Add profile and tracking fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS "fullName" VARCHAR(255);

ALTER TABLE users ADD COLUMN IF NOT EXISTS "profileImage" VARCHAR(500);

ALTER TABLE users ADD COLUMN IF NOT EXISTS "lastLogin" TIMESTAMP;

ALTER TABLE users ADD COLUMN IF NOT EXISTS "department" VARCHAR(100);

-- 4. Update Deliverables Table
-- Add version and approval tracking
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS "version" VARCHAR(50) DEFAULT '1.0';

ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS "approvalStatus" VARCHAR(50) DEFAULT 'pending' 
  CHECK ("approvalStatus" IN ('pending', 'approved', 'rejected', 'revision_requested'));

ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS "approvedBy" INTEGER REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP;

-- 5. Update Bugs Table
-- Add additional tracking fields
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS "environment" VARCHAR(100);

ALTER TABLE bugs ADD COLUMN IF NOT EXISTS "browserInfo" VARCHAR(255);

ALTER TABLE bugs ADD COLUMN IF NOT EXISTS "deviceInfo" VARCHAR(255);

ALTER TABLE bugs ADD COLUMN IF NOT EXISTS "screenshotUrl" VARCHAR(500);

ALTER TABLE bugs ADD COLUMN IF NOT EXISTS "resolvedAt" TIMESTAMP;

ALTER TABLE bugs ADD COLUMN IF NOT EXISTS "resolvedBy" INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- 6. Update Test Cases Table
-- Add execution tracking
ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS "executedBy" INTEGER REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS "executionDate" TIMESTAMP;

ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS "actualResult" TEXT;

ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS "attachmentUrl" VARCHAR(500);

-- 7. Update Sprints Table (if exists)
-- Add velocity and metrics
ALTER TABLE sprints ADD COLUMN IF NOT EXISTS "velocity" INTEGER DEFAULT 0;

ALTER TABLE sprints ADD COLUMN IF NOT EXISTS "completedPoints" INTEGER DEFAULT 0;

ALTER TABLE sprints ADD COLUMN IF NOT EXISTS "totalPoints" INTEGER DEFAULT 0;

-- Success message
SELECT 'Migration 01 completed: Existing tables updated successfully!' as message;
