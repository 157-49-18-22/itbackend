-- =====================================================
-- MySQL to PostgreSQL Migration Script (SAFE VERSION)
-- IT Agency PMS - Complete Database Schema
-- This version uses DROP TABLE IF EXISTS to avoid errors
-- =====================================================

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users Table
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Developer',
    avatar VARCHAR(255),
    phone VARCHAR(20),
    department VARCHAR(50) DEFAULT 'Development',
    designation VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    "joinDate" TIMESTAMP,
    skills JSONB,
    bio TEXT,
    "socialLinks" JSONB,
    preferences JSONB,
    "lastLogin" TIMESTAMP,
    "refreshToken" VARCHAR(500),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clients Table
DROP TABLE IF EXISTS clients CASCADE;
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(255),
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address JSONB,
    industry VARCHAR(100),
    website VARCHAR(255),
    "contactPerson" JSONB,
    status VARCHAR(20) DEFAULT 'Active',
    notes TEXT,
    tags JSONB,
    "socialLinks" JSONB,
    "billingInfo" JSONB,
    company VARCHAR(100),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
DROP TABLE IF EXISTS projects CASCADE;
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    "clientId" INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Planning',
    priority VARCHAR(20) DEFAULT 'Medium',
    "currentPhase" VARCHAR(50) DEFAULT 'Planning',
    progress INTEGER DEFAULT 0,
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP NOT NULL,
    "actualEndDate" TIMESTAMP,
    budget JSONB,
    "projectManagerId" INTEGER REFERENCES users(id),
    "teamMembers" JSONB,
    phases JSONB,
    tags JSONB,
    attachments JSONB,
    repository JSONB,
    "isArchived" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks Table
DROP TABLE IF EXISTS tasks CASCADE;
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo',
    priority VARCHAR(20) DEFAULT 'medium',
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    "assigneeId" INTEGER REFERENCES users(id),
    "reporterId" INTEGER REFERENCES users(id),
    "dueDate" TIMESTAMP,
    "estimatedHours" DECIMAL(10,2),
    "actualHours" DECIMAL(10,2),
    labels JSONB,
    "sprintId" INTEGER,
    "storyPoints" INTEGER DEFAULT 0,
    type VARCHAR(20) DEFAULT 'task',
    "startDate" TIMESTAMP,
    "endDate" TIMESTAMP,
    phase VARCHAR(50) DEFAULT 'Development',
    tags JSONB DEFAULT '[]'::jsonb,
    attachments JSONB DEFAULT '[]'::jsonb,
    comments JSONB DEFAULT '[]'::jsonb,
    checklist JSONB DEFAULT '[]'::jsonb,
    dependencies JSONB DEFAULT '[]'::jsonb,
    "stageId" INTEGER,
    "completionDate" TIMESTAMP,
    "orderIndex" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- DESIGN & UI/UX TABLES
-- =====================================================

-- Wireframes Table
DROP TABLE IF EXISTS wireframes CASCADE;
CREATE TABLE wireframes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50) DEFAULT '1.0',
    status VARCHAR(20) DEFAULT 'draft',
    category VARCHAR(50) DEFAULT 'web',
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    created_by INTEGER,
    approved_by INTEGER,
    approved_at TIMESTAMP,
    feedback TEXT,
    updated_by INTEGER,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Mockups Table
DROP TABLE IF EXISTS mockups CASCADE;
CREATE TABLE mockups (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50) DEFAULT '1.0',
    status VARCHAR(20) DEFAULT 'draft',
    category VARCHAR(50) DEFAULT 'web',
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    created_by INTEGER,
    approved_by INTEGER,
    approved_at TIMESTAMP,
    feedback TEXT,
    updated_by INTEGER,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Prototypes Table
DROP TABLE IF EXISTS prototypes CASCADE;
CREATE TABLE prototypes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50) DEFAULT '1.0',
    status VARCHAR(20) DEFAULT 'draft',
    category VARCHAR(50) DEFAULT 'web',
    link VARCHAR(500),
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    created_by INTEGER,
    approved_by INTEGER,
    approved_at TIMESTAMP,
    feedback TEXT,
    updated_by INTEGER,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- DEVELOPMENT TABLES
-- =====================================================

-- Code Files Table
DROP TABLE IF EXISTS codefiles CASCADE;
CREATE TABLE codefiles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    language VARCHAR(255) DEFAULT 'javascript',
    path VARCHAR(255),
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    "createdBy" INTEGER NOT NULL REFERENCES users(id),
    "updatedBy" INTEGER REFERENCES users(id),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP
);

-- Code Repositories Table
DROP TABLE IF EXISTS code_repositories CASCADE;
CREATE TABLE code_repositories (
    repo_id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    repo_name VARCHAR(255) NOT NULL,
    repo_url VARCHAR(500),
    repo_type VARCHAR(20) DEFAULT 'github',
    branch_name VARCHAR(100) DEFAULT 'main',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Code Reviews Table
DROP TABLE IF EXISTS code_reviews CASCADE;
CREATE TABLE code_reviews (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    author VARCHAR(100),
    reviewer VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    branch VARCHAR(100),
    code_url VARCHAR(255),
    files_changed INTEGER DEFAULT 0,
    lines_added INTEGER DEFAULT 0,
    lines_removed INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TESTING TABLES
-- =====================================================

-- Test Cases Table
DROP TABLE IF EXISTS test_cases CASCADE;
CREATE TABLE test_cases (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'functional',
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'not_run',
    steps JSONB,
    expected_result TEXT,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    created_by INTEGER NOT NULL REFERENCES users(id),
    assigned_to INTEGER REFERENCES users(id),
    last_run TIMESTAMP,
    "executedBy" INTEGER,
    "executionDate" TIMESTAMP,
    "actualResult" TEXT,
    "attachmentUrl" VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test Results Table
DROP TABLE IF EXISTS test_results CASCADE;
CREATE TABLE test_results (
    id SERIAL PRIMARY KEY,
    status VARCHAR(20) NOT NULL,
    notes TEXT,
    test_case_id INTEGER NOT NULL REFERENCES test_cases(id) ON DELETE CASCADE,
    executed_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- UAT Table
DROP TABLE IF EXISTS uats CASCADE;
CREATE TABLE uats (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    steps JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    tester VARCHAR(255),
    "commentsCount" INTEGER DEFAULT 0,
    "projectId" INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    "createdBy" INTEGER NOT NULL REFERENCES users(id),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bugs Table
DROP TABLE IF EXISTS bugs CASCADE;
CREATE TABLE bugs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'open',
    priority VARCHAR(20) DEFAULT 'medium',
    severity VARCHAR(20) DEFAULT 'medium',
    steps_to_reproduce TEXT,
    expected_result TEXT,
    actual_result TEXT,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    reported_by INTEGER NOT NULL REFERENCES users(id),
    assigned_to INTEGER REFERENCES users(id),
    environment VARCHAR(100),
    "browserInfo" VARCHAR(255),
    "deviceInfo" VARCHAR(255),
    "screenshotUrl" VARCHAR(500),
    "resolvedAt" TIMESTAMP,
    "resolvedBy" INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bug Comments Table
DROP TABLE IF EXISTS bug_comments CASCADE;
CREATE TABLE bug_comments (
    id SERIAL PRIMARY KEY,
    comment TEXT NOT NULL,
    bug_id INTEGER NOT NULL REFERENCES bugs(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance Tests Table
DROP TABLE IF EXISTS performance_tests CASCADE;
CREATE TABLE performance_tests (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    test_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'running',
    url VARCHAR(255),
    duration INTEGER,
    concurrent_users INTEGER,
    target_response_time INTEGER,
    avg_response_time INTEGER DEFAULT 0,
    max_response_time INTEGER DEFAULT 0,
    min_response_time INTEGER DEFAULT 0,
    throughput FLOAT DEFAULT 0,
    error_rate FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- DEPLOYMENT & WORKFLOW TABLES
-- =====================================================

-- Deployments Table
DROP TABLE IF EXISTS deployments CASCADE;
CREATE TABLE deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "projectId" INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    environment VARCHAR(50) DEFAULT 'development',
    branch VARCHAR(255) NOT NULL,
    "commitHash" VARCHAR(255),
    "commitMessage" TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    "startedAt" TIMESTAMP NOT NULL,
    "completedAt" TIMESTAMP,
    "deployedBy" INTEGER NOT NULL REFERENCES users(id),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP
);

-- Workflow States Table
DROP TABLE IF EXISTS workflow_states CASCADE;
CREATE TABLE workflow_states (
    id SERIAL PRIMARY KEY,
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    stage VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'not_started',
    "startedAt" TIMESTAMP,
    "completedAt" TIMESTAMP,
    "blockedReason" TEXT,
    notes TEXT,
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stage Transitions Table
DROP TABLE IF EXISTS stage_transitions CASCADE;
CREATE TABLE stage_transitions (
    id SERIAL PRIMARY KEY,
    "taskId" INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    "fromStage" VARCHAR(50) NOT NULL,
    "toStage" VARCHAR(50) NOT NULL,
    "userId" INTEGER NOT NULL REFERENCES users(id),
    comments TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Stages Table
DROP TABLE IF EXISTS project_stages CASCADE;
CREATE TABLE project_stages (
    id SERIAL PRIMARY KEY,
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    "stageNumber" INTEGER NOT NULL,
    "stageName" VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'not_started',
    "startDate" DATE,
    "endDate" DATE,
    "actualStartDate" DATE,
    "actualEndDate" DATE,
    "progressPercentage" INTEGER DEFAULT 0,
    "assignedTeamLead" INTEGER REFERENCES users(id),
    notes TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- COLLABORATION TABLES
-- =====================================================

-- Messages Table
DROP TABLE IF EXISTS messages CASCADE;
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    "senderId" INTEGER NOT NULL REFERENCES users(id),
    "projectId" INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    thread VARCHAR(100) NOT NULL,
    recipients JSONB,
    attachments JSONB,
    "readBy" JSONB,
    "isStarred" JSONB,
    "isArchived" BOOLEAN DEFAULT FALSE,
    "parentMessageId" INTEGER REFERENCES messages(id),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments Table
DROP TABLE IF EXISTS comments CASCADE;
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    "projectId" INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    "taskId" INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    "deliverableId" INTEGER,
    "bugId" INTEGER REFERENCES bugs(id) ON DELETE CASCADE,
    "userId" INTEGER NOT NULL REFERENCES users(id),
    "commentText" TEXT NOT NULL,
    "parentCommentId" INTEGER REFERENCES comments(id),
    "isEdited" BOOLEAN DEFAULT FALSE,
    "editedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
DROP TABLE IF EXISTS notifications CASCADE;
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    "isRead" BOOLEAN DEFAULT FALSE,
    "readAt" TIMESTAMP,
    "relatedType" VARCHAR(50),
    "relatedId" INTEGER,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- DELIVERABLES & APPROVALS
-- =====================================================

-- Deliverables Table
DROP TABLE IF EXISTS deliverables CASCADE;
CREATE TABLE deliverables (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    filename VARCHAR(255),
    description TEXT,
    type VARCHAR(50),
    size INTEGER,
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Draft',
    stage VARCHAR(50),
    version VARCHAR(20),
    "fileUrl" VARCHAR(500),
    "dueDate" TIMESTAMP,
    "submittedAt" TIMESTAMP,
    "approvedAt" TIMESTAMP,
    "rejectedAt" TIMESTAMP,
    "rejectionReason" TEXT,
    "uploadedById" INTEGER REFERENCES users(id),
    "fileSize" BIGINT DEFAULT 0,
    "fileType" VARCHAR(100) DEFAULT 'File',
    phase VARCHAR(50) DEFAULT 'Initial',
    tags TEXT,
    versions TEXT,
    approvals TEXT,
    "isArchived" BOOLEAN DEFAULT FALSE,
    "completedAt" TIMESTAMP,
    "approvalStatus" VARCHAR(50) DEFAULT 'pending',
    "approvedBy" INTEGER,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Approvals Table
DROP TABLE IF EXISTS approvals CASCADE;
CREATE TABLE approvals (
    id SERIAL PRIMARY KEY,
    "approvalId" VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    "requestedById" INTEGER NOT NULL REFERENCES users(id),
    "requestedToId" INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'Pending',
    priority VARCHAR(20) DEFAULT 'Medium',
    notes TEXT,
    version VARCHAR(50) DEFAULT '-',
    attachments JSONB,
    "approvedAt" TIMESTAMP,
    "rejectedAt" TIMESTAMP,
    "rejectionReason" TEXT,
    "relatedDeliverableId" INTEGER REFERENCES deliverables(id),
    "dueDate" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TIME TRACKING & SPRINTS
-- =====================================================

-- Time Tracking Table
DROP TABLE IF EXISTS time_tracking CASCADE;
CREATE TABLE time_tracking (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    "taskId" INTEGER,
    description TEXT,
    "startTime" TIMESTAMP NOT NULL,
    "endTime" TIMESTAMP,
    duration INTEGER DEFAULT 0,
    "isBillable" BOOLEAN DEFAULT TRUE,
    "hourlyRate" DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'Stopped',
    tags JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Time Logs Table
DROP TABLE IF EXISTS time_logs CASCADE;
CREATE TABLE time_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    hours_worked DECIMAL(10,2) NOT NULL,
    work_description TEXT,
    log_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sprints Table
DROP TABLE IF EXISTS sprints CASCADE;
CREATE TABLE sprints (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    goal TEXT,
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'planned',
    velocity INTEGER DEFAULT 0,
    "completedPoints" INTEGER DEFAULT 0,
    "totalPoints" INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    completed_points INTEGER DEFAULT 0,
    tasks JSONB DEFAULT '[]'::jsonb,
    retrospective TEXT,
    notes TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sprint Tasks Table
DROP TABLE IF EXISTS sprint_tasks CASCADE;
CREATE TABLE sprint_tasks (
    id SERIAL PRIMARY KEY,
    sprint_id INTEGER NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- FEEDBACK & BLOCKERS
-- =====================================================

-- Feedbacks Table
DROP TABLE IF EXISTS feedbacks CASCADE;
CREATE TABLE feedbacks (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    "taskId" INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    "taskName" VARCHAR(255) NOT NULL,
    feedback TEXT NOT NULL,
    suggestions JSONB,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending',
    "reviewerId" INTEGER NOT NULL REFERENCES users(id),
    "developerId" INTEGER NOT NULL REFERENCES users(id),
    "addressedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blockers Table
DROP TABLE IF EXISTS blockers CASCADE;
CREATE TABLE blockers (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'open',
    "taskId" INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    "reportedBy" INTEGER NOT NULL REFERENCES users(id),
    "resolvedBy" INTEGER REFERENCES users(id),
    "resolvedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CALENDAR & EVENTS
-- =====================================================

-- Calendar Events Table
DROP TABLE IF EXISTS calendar_events CASCADE;
CREATE TABLE calendar_events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP NOT NULL,
    "allDay" BOOLEAN DEFAULT FALSE,
    location VARCHAR(255),
    "meetingLink" VARCHAR(500),
    "projectId" INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    "organizerId" INTEGER NOT NULL REFERENCES users(id),
    attendees JSONB,
    reminder JSONB,
    color VARCHAR(20) DEFAULT '#3b82f6',
    "isRecurring" BOOLEAN DEFAULT FALSE,
    recurrence JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- AUDIT & ACTIVITY LOGS
-- =====================================================

-- Activity Logs Table
DROP TABLE IF EXISTS activity_logs CASCADE;
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Trail Table
DROP TABLE IF EXISTS audit_trail CASCADE;
CREATE TABLE audit_trail (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "actionType" VARCHAR(100) NOT NULL,
    "entityType" VARCHAR(100) NOT NULL,
    "entityId" INTEGER,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" VARCHAR(50),
    "userAgent" TEXT,
    description TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- FILE ATTACHMENTS
-- =====================================================

-- File Attachments Table
DROP TABLE IF EXISTS file_attachments CASCADE;
CREATE TABLE file_attachments (
    id SERIAL PRIMARY KEY,
    "fileName" VARCHAR(255) NOT NULL,
    "filePath" VARCHAR(500) NOT NULL,
    "fileSize" BIGINT,
    "fileType" VARCHAR(100),
    "mimeType" VARCHAR(100),
    "uploadedBy" INTEGER NOT NULL REFERENCES users(id),
    "projectId" INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    "taskId" INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    "commentId" INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    "messageId" INTEGER REFERENCES messages(id) ON DELETE CASCADE,
    description TEXT,
    "isPublic" BOOLEAN DEFAULT FALSE,
    "downloadCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TASK CHECKLISTS
-- =====================================================

-- Task Checklists Table
DROP TABLE IF EXISTS task_checklists CASCADE;
CREATE TABLE task_checklists (
    id SERIAL PRIMARY KEY,
    "taskId" INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    description VARCHAR(500) NOT NULL,
    "isCompleted" BOOLEAN DEFAULT FALSE,
    "completedAt" TIMESTAMP,
    "completedBy" INTEGER REFERENCES users(id),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task Comments Table
DROP TABLE IF EXISTS task_comments CASCADE;
CREATE TABLE task_comments (
    comment_id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- DOCUMENTATION & DISCUSSIONS
-- =====================================================

-- Documents Table
DROP TABLE IF EXISTS documents CASCADE;
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    description TEXT,
    content TEXT,
    author VARCHAR(100),
    status VARCHAR(20) DEFAULT 'draft',
    views INTEGER DEFAULT 0,
    sections_count INTEGER DEFAULT 1,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Discussions Table
DROP TABLE IF EXISTS discussions CASCADE;
CREATE TABLE discussions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'General',
    content TEXT,
    excerpt TEXT,
    tags JSONB,
    replies_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TRANSACTIONS & VERSION HISTORY
-- =====================================================

-- Transactions Table
DROP TABLE IF EXISTS transactions CASCADE;
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    description TEXT,
    amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Version History Table
DROP TABLE IF EXISTS version_history CASCADE;
CREATE TABLE version_history (
    id SERIAL PRIMARY KEY,
    version VARCHAR(20) NOT NULL,
    type VARCHAR(20) DEFAULT 'patch',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    author VARCHAR(100),
    release_date DATE,
    release_time VARCHAR(20),
    branch VARCHAR(100),
    commit_hash VARCHAR(40),
    files_changed INTEGER DEFAULT 0,
    additions INTEGER DEFAULT 0,
    deletions INTEGER DEFAULT 0,
    changes JSONB,
    status VARCHAR(20) DEFAULT 'development',
    deployed_to VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ADDITIONAL LEGACY/MIGRATION TABLES
-- =====================================================

-- Sequelize Meta Table (for migrations tracking)
DROP TABLE IF EXISTS sequelizemeta CASCADE;
CREATE TABLE sequelizemeta (
    name VARCHAR(255) PRIMARY KEY
);

-- Legacy Wireframe Table (singular)
DROP TABLE IF EXISTS wireframe CASCADE;
CREATE TABLE wireframe (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    version VARCHAR(50) DEFAULT '1.0',
    status VARCHAR(20) DEFAULT 'draft',
    category VARCHAR(50) DEFAULT 'web',
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Legacy Mockup Table (singular)
DROP TABLE IF EXISTS mockup CASCADE;
CREATE TABLE mockup (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    version VARCHAR(50) DEFAULT '1.0',
    status VARCHAR(20) DEFAULT 'draft',
    category VARCHAR(50) DEFAULT 'Web App',
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Legacy Prototype Table (singular)
DROP TABLE IF EXISTS prototype CASCADE;
CREATE TABLE prototype (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    link VARCHAR(500),
    version VARCHAR(50) DEFAULT '1.0',
    status VARCHAR(20) DEFAULT 'draft',
    category VARCHAR(50) DEFAULT 'web',
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Legacy CodeFile Table (singular)
DROP TABLE IF EXISTS codefile CASCADE;
CREATE TABLE codefile (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    language VARCHAR(255) DEFAULT 'javascript',
    path VARCHAR(255),
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    "createdBy" INTEGER NOT NULL REFERENCES users(id),
    "updatedBy" INTEGER REFERENCES users(id),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP
);

-- New Approvals Table (alternative schema)
DROP TABLE IF EXISTS approvals_new CASCADE;
CREATE TABLE approvals_new (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "projectId" INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    "stageId" INTEGER,
    "deliverableId" INTEGER REFERENCES deliverables(id),
    "taskId" INTEGER REFERENCES tasks(id),
    "requestedBy" INTEGER NOT NULL REFERENCES users(id),
    "requestedTo" INTEGER NOT NULL REFERENCES users(id),
    "approvalType" VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    "relatedId" INTEGER,
    "relatedType" VARCHAR(50),
    comments TEXT,
    "rejectionReason" TEXT,
    priority VARCHAR(20) DEFAULT 'medium',
    "dueDate" TIMESTAMP,
    "requestedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP,
    "respondedBy" INTEGER REFERENCES users(id),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- New Calendar Events Table (alternative schema)
DROP TABLE IF EXISTS calendar_events_new CASCADE;
CREATE TABLE calendar_events_new (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP NOT NULL,
    "allDay" BOOLEAN DEFAULT FALSE,
    "eventType" VARCHAR(50),
    "projectId" INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    "taskId" INTEGER REFERENCES tasks(id),
    "createdBy" INTEGER NOT NULL REFERENCES users(id),
    location VARCHAR(255),
    "meetingUrl" VARCHAR(500),
    attendees JSONB,
    "reminderMinutes" INTEGER DEFAULT 15,
    "isRecurring" BOOLEAN DEFAULT FALSE,
    "recurrenceRule" VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- New Notifications Table (alternative schema)
DROP TABLE IF EXISTS notifications_new CASCADE;
CREATE TABLE notifications_new (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    "isRead" BOOLEAN DEFAULT FALSE,
    "readAt" TIMESTAMP,
    "relatedId" INTEGER,
    "relatedType" VARCHAR(50),
    link VARCHAR(500),
    priority VARCHAR(20) DEFAULT 'normal',
    "actionRequired" BOOLEAN DEFAULT FALSE,
    "expiresAt" TIMESTAMP,
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- New Stage Transitions Table (alternative schema)
DROP TABLE IF EXISTS stage_transitions_new CASCADE;
CREATE TABLE stage_transitions_new (
    id SERIAL PRIMARY KEY,
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    "fromStage" VARCHAR(100),
    "toStage" VARCHAR(100) NOT NULL,
    "fromStageId" INTEGER,
    "toStageId" INTEGER,
    "transitionedBy" INTEGER NOT NULL REFERENCES users(id),
    reason TEXT,
    notes TEXT,
    "checklistCompleted" BOOLEAN DEFAULT FALSE,
    "approvalReceived" BOOLEAN DEFAULT FALSE,
    "approvalId" INTEGER,
    metadata JSONB,
    "transitionedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- New Task Checklists Table (alternative schema)
DROP TABLE IF EXISTS task_checklists_new CASCADE;
CREATE TABLE task_checklists_new (
    id SERIAL PRIMARY KEY,
    "taskId" INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "isCompleted" BOOLEAN DEFAULT FALSE,
    "completedBy" INTEGER REFERENCES users(id),
    "completedAt" TIMESTAMP,
    "orderIndex" INTEGER DEFAULT 0,
    "dueDate" TIMESTAMP,
    priority VARCHAR(20) DEFAULT 'medium',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_status;
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Projects indexes
DROP INDEX IF EXISTS idx_projects_client;
DROP INDEX IF EXISTS idx_projects_status;
DROP INDEX IF EXISTS idx_projects_phase;
CREATE INDEX idx_projects_client ON projects("clientId");
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_phase ON projects("currentPhase");

-- Tasks indexes
DROP INDEX IF EXISTS idx_tasks_project;
DROP INDEX IF EXISTS idx_tasks_assignee;
DROP INDEX IF EXISTS idx_tasks_status;
DROP INDEX IF EXISTS idx_tasks_due_date;
CREATE INDEX idx_tasks_project ON tasks("projectId");
CREATE INDEX idx_tasks_assignee ON tasks("assigneeId");
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks("dueDate");

-- Bugs indexes
DROP INDEX IF EXISTS idx_bugs_project;
DROP INDEX IF EXISTS idx_bugs_status;
DROP INDEX IF EXISTS idx_bugs_severity;
CREATE INDEX idx_bugs_project ON bugs(project_id);
CREATE INDEX idx_bugs_status ON bugs(status);
CREATE INDEX idx_bugs_severity ON bugs(severity);

-- Approvals indexes
DROP INDEX IF EXISTS idx_approvals_project;
DROP INDEX IF EXISTS idx_approvals_status;
CREATE INDEX idx_approvals_project ON approvals("projectId");
CREATE INDEX idx_approvals_status ON approvals(status);

-- Notifications indexes
DROP INDEX IF EXISTS idx_notifications_user;
DROP INDEX IF EXISTS idx_notifications_read;
CREATE INDEX idx_notifications_user ON notifications("userId");
CREATE INDEX idx_notifications_read ON notifications("isRead");

-- Time tracking indexes
DROP INDEX IF EXISTS idx_time_tracking_user;
DROP INDEX IF EXISTS idx_time_tracking_project;
CREATE INDEX idx_time_tracking_user ON time_tracking("userId");
CREATE INDEX idx_time_tracking_project ON time_tracking("projectId");

-- =====================================================
-- DEFAULT ADMIN USER
-- =====================================================

INSERT INTO users (name, email, password, role, department, status, "createdAt", "updatedAt")
VALUES (
    'Admin',
    'admin@itagency.com',
    'admin123',
    'Admin',
    'Management',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
