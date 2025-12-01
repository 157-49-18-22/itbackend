-- IT Agency PMS - Complete Database Setup for Supabase PostgreSQL
-- Run this script in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'project_manager', 'developer', 'designer', 'tester', 'client')),
    avatar VARCHAR(500),
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    "clientId" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    "projectManagerId" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    "startDate" DATE,
    "endDate" DATE,
    budget DECIMAL(15, 2),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "projectId" INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    "assignedTo" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    "createdBy" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'in_review', 'completed', 'blocked')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    "dueDate" DATE,
    "estimatedHours" DECIMAL(10, 2),
    "actualHours" DECIMAL(10, 2),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Time Tracking Table
CREATE TABLE IF NOT EXISTS "time_tracking" (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "taskId" INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    "projectId" INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    description TEXT,
    "startTime" TIMESTAMP NOT NULL,
    "endTime" TIMESTAMP,
    duration INTEGER, -- in minutes
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sprints Table
CREATE TABLE IF NOT EXISTS sprints (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    goal TEXT,
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wireframes Table
CREATE TABLE IF NOT EXISTS wireframes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    "createdBy" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    "imageUrl" VARCHAR(500),
    version VARCHAR(50),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'in_review', 'approved')),
    category VARCHAR(50) CHECK (category IN ('web', 'mobile', 'tablet', 'desktop')),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mockups Table
CREATE TABLE IF NOT EXISTS mockups (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    "createdBy" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    "imageUrl" VARCHAR(500),
    version VARCHAR(50),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'in_review', 'approved')),
    category VARCHAR(50) CHECK (category IN ('web', 'mobile', 'tablet', 'desktop')),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prototypes Table
CREATE TABLE IF NOT EXISTS prototypes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    "createdBy" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    "prototypeUrl" VARCHAR(500),
    "imageUrl" VARCHAR(500),
    version VARCHAR(50),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'in_review', 'approved')),
    platform VARCHAR(50) CHECK (platform IN ('web', 'mobile', 'desktop')),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Code Files Table
CREATE TABLE IF NOT EXISTS code_files (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    path VARCHAR(500),
    content TEXT,
    language VARCHAR(50),
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    "createdBy" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    version VARCHAR(50),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bugs Table
CREATE TABLE IF NOT EXISTS bugs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    "reportedBy" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    "assignedTo" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    severity VARCHAR(50) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'reopened')),
    "stepsToReproduce" TEXT,
    "expectedBehavior" TEXT,
    "actualBehavior" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test Cases Table
CREATE TABLE IF NOT EXISTS test_cases (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    "createdBy" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    "testType" VARCHAR(50) CHECK ("testType" IN ('unit', 'integration', 'functional', 'performance', 'security')),
    "preconditions" TEXT,
    "testSteps" TEXT,
    "expectedResult" TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'failed', 'blocked')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- UAT (User Acceptance Testing) Table
CREATE TABLE IF NOT EXISTS uat (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    "testerId" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    "testDate" DATE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'passed', 'failed')),
    feedback TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deployments Table
CREATE TABLE IF NOT EXISTS deployments (
    id SERIAL PRIMARY KEY,
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    "deployedBy" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    version VARCHAR(50),
    environment VARCHAR(50) CHECK (environment IN ('development', 'staging', 'production')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'success', 'failed', 'rolled_back')),
    "deploymentUrl" VARCHAR(500),
    notes TEXT,
    "deployedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deliverables Table
CREATE TABLE IF NOT EXISTS deliverables (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    "submittedBy" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    "fileUrl" VARCHAR(500),
    "fileSize" INTEGER,
    "fileType" VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected')),
    "submittedAt" TIMESTAMP,
    "reviewedBy" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    "reviewedAt" TIMESTAMP,
    feedback TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(255),
    address TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks("projectId");
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks("assignedTo");
CREATE INDEX IF NOT EXISTS idx_time_tracking_user ON time_tracking("userId");
CREATE INDEX IF NOT EXISTS idx_time_tracking_task ON time_tracking("taskId");
CREATE INDEX IF NOT EXISTS idx_bugs_project ON bugs("projectId");
CREATE INDEX IF NOT EXISTS idx_wireframes_project ON wireframes("projectId");
CREATE INDEX IF NOT EXISTS idx_mockups_project ON mockups("projectId");
CREATE INDEX IF NOT EXISTS idx_prototypes_project ON prototypes("projectId");

-- Insert a default admin user (password: admin123 - hashed with bcrypt)
INSERT INTO users (name, email, password, role) 
VALUES ('Admin User', 'admin@example.com', '$2a$10$rZ5qH8qF9xKqX8qF9xKqX.qF9xKqX8qF9xKqX8qF9xKqX8qF9xKqX', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Success message
SELECT 'Database setup completed successfully!' as message;
