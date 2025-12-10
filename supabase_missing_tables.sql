-- Missing Tables for Supabase (10 Additional Tables)
-- Run this script in Supabase SQL Editor to add missing tables

-- 1. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'task', 'project', 'bug', 'approval')),
    "isRead" BOOLEAN DEFAULT FALSE,
    "relatedId" INTEGER,
    "relatedType" VARCHAR(50),
    link VARCHAR(500),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 2. Activity Log Table
CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    "entityType" VARCHAR(100),
    "entityId" INTEGER,
    description TEXT,
    "ipAddress" VARCHAR(50),
    "userAgent" TEXT,
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bug Comments Table
CREATE TABLE IF NOT EXISTS bug_comments (
    id SERIAL PRIMARY KEY,
    "bugId" INTEGER NOT NULL REFERENCES bugs(id) ON DELETE CASCADE,
    "userId" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    comment TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Approvals Table
CREATE TABLE IF NOT EXISTS approvals (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "projectId" INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    "requestedBy" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    "approvedBy" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    "approvalType" VARCHAR(50) CHECK ("approvalType" IN ('design', 'code', 'deployment', 'deliverable', 'budget', 'timeline')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    "relatedId" INTEGER,
    "relatedType" VARCHAR(50),
    comments TEXT,
    "requestedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    "senderId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "receiverId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "projectId" INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    "isRead" BOOLEAN DEFAULT FALSE,
    "readAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Calendar Events Table
CREATE TABLE IF NOT EXISTS calendar_events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP NOT NULL,
    "allDay" BOOLEAN DEFAULT FALSE,
    "eventType" VARCHAR(50) CHECK ("eventType" IN ('meeting', 'deadline', 'milestone', 'holiday', 'other')),
    "projectId" INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    "createdBy" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    location VARCHAR(255),
    "meetingUrl" VARCHAR(500),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Test Results Table
CREATE TABLE IF NOT EXISTS test_results (
    id SERIAL PRIMARY KEY,
    "testCaseId" INTEGER NOT NULL REFERENCES test_cases(id) ON DELETE CASCADE,
    "executedBy" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'failed', 'blocked', 'skipped')),
    "executionDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "actualResult" TEXT,
    notes TEXT,
    "attachmentUrl" VARCHAR(500),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Stage Transitions Table
CREATE TABLE IF NOT EXISTS stage_transitions (
    id SERIAL PRIMARY KEY,
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    "fromStage" VARCHAR(100),
    "toStage" VARCHAR(100) NOT NULL,
    "transitionedBy" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    notes TEXT,
    "transitionedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Task Checklists Table
CREATE TABLE IF NOT EXISTS task_checklists (
    id SERIAL PRIMARY KEY,
    "taskId" INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    "isCompleted" BOOLEAN DEFAULT FALSE,
    "completedBy" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    "completedAt" TIMESTAMP,
    "orderIndex" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Workflow States Table
CREATE TABLE IF NOT EXISTS workflow_states (
    id SERIAL PRIMARY KEY,
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    stage VARCHAR(100) NOT NULL CHECK (stage IN ('planning', 'design', 'development', 'testing', 'deployment', 'completed')),
    status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'blocked')),
    "startedAt" TIMESTAMP,
    "completedAt" TIMESTAMP,
    notes TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications("userId");
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications("isRead");
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log("userId");
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log("entityType", "entityId");
CREATE INDEX IF NOT EXISTS idx_bug_comments_bug ON bug_comments("bugId");
CREATE INDEX IF NOT EXISTS idx_approvals_project ON approvals("projectId");
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages("senderId");
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages("receiverId");
CREATE INDEX IF NOT EXISTS idx_calendar_events_project ON calendar_events("projectId");
CREATE INDEX IF NOT EXISTS idx_test_results_case ON test_results("testCaseId");
CREATE INDEX IF NOT EXISTS idx_stage_transitions_project ON stage_transitions("projectId");
CREATE INDEX IF NOT EXISTS idx_task_checklists_task ON task_checklists("taskId");
CREATE INDEX IF NOT EXISTS idx_workflow_states_project ON workflow_states("projectId");

-- Success message
SELECT 'Missing tables created successfully! Total tables should now be 25.' as message;
