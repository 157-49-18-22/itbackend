-- =====================================================
-- MASTER MIGRATION FILE - RUN ALL AT ONCE
-- IT Agency Project Management System
-- Complete Database Schema Update
-- =====================================================
-- 
-- WARNING: This file contains ALL migrations in sequence
-- Only use this if you want to run everything at once
-- Otherwise, run individual migration files in order
--
-- IMPORTANT: BACKUP YOUR DATABASE BEFORE RUNNING!
--
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- MIGRATION 01: Update Existing Tables
-- =====================================================

-- Update Projects Table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "currentStage" VARCHAR(50) DEFAULT 'ui_ux' 
  CHECK ("currentStage" IN ('ui_ux', 'development', 'testing', 'completed'));
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "actualEndDate" DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "projectType" VARCHAR(100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "category" VARCHAR(100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "projectManagerId" INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Update Tasks Table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS "stageId" INTEGER;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS "dependencies" JSONB DEFAULT '[]';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS "completionDate" TIMESTAMP;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS "orderIndex" INTEGER DEFAULT 0;

-- Update Users Table
ALTER TABLE users ADD COLUMN IF NOT EXISTS "fullName" VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS "profileImage" VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS "lastLogin" TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "department" VARCHAR(100);

-- Update Deliverables Table
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS "version" VARCHAR(50) DEFAULT '1.0';
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS "approvalStatus" VARCHAR(50) DEFAULT 'pending' 
  CHECK ("approvalStatus" IN ('pending', 'approved', 'rejected', 'revision_requested'));
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS "approvedBy" INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP;

-- Update Bugs Table
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS "environment" VARCHAR(100);
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS "browserInfo" VARCHAR(255);
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS "deviceInfo" VARCHAR(255);
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS "screenshotUrl" VARCHAR(500);
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS "resolvedAt" TIMESTAMP;
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS "resolvedBy" INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Update Test Cases Table
ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS "executedBy" INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS "executionDate" TIMESTAMP;
ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS "actualResult" TEXT;
ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS "attachmentUrl" VARCHAR(500);

-- Update Sprints Table (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sprints') THEN
        ALTER TABLE sprints ADD COLUMN IF NOT EXISTS "velocity" INTEGER DEFAULT 0;
        ALTER TABLE sprints ADD COLUMN IF NOT EXISTS "completedPoints" INTEGER DEFAULT 0;
        ALTER TABLE sprints ADD COLUMN IF NOT EXISTS "totalPoints" INTEGER DEFAULT 0;
    END IF;
END $$;

SELECT 'Migration 01 completed!' as message;

-- =====================================================
-- MIGRATION 02: Create Project Stages Table
-- =====================================================

CREATE TABLE IF NOT EXISTS project_stages (
    id SERIAL PRIMARY KEY,
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    "stageNumber" INTEGER NOT NULL CHECK ("stageNumber" IN (1, 2, 3)),
    "stageName" VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'blocked')),
    "startDate" DATE,
    "endDate" DATE,
    "actualStartDate" DATE,
    "actualEndDate" DATE,
    "progressPercentage" INTEGER DEFAULT 0 CHECK ("progressPercentage" >= 0 AND "progressPercentage" <= 100),
    "assignedTeamLead" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("projectId", "stageNumber")
);

CREATE INDEX IF NOT EXISTS idx_project_stages_project ON project_stages("projectId");
CREATE INDEX IF NOT EXISTS idx_project_stages_status ON project_stages(status);

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_stageid_fkey;
ALTER TABLE tasks ADD CONSTRAINT tasks_stageid_fkey 
    FOREIGN KEY ("stageId") REFERENCES project_stages(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION update_project_stages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS project_stages_updated_at ON project_stages;
CREATE TRIGGER project_stages_updated_at
    BEFORE UPDATE ON project_stages
    FOR EACH ROW
    EXECUTE FUNCTION update_project_stages_updated_at();

SELECT 'Migration 02 completed!' as message;

-- =====================================================
-- MIGRATION 03: Create Comments Table
-- =====================================================

CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    "projectId" INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    "taskId" INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    "deliverableId" INTEGER REFERENCES deliverables(id) ON DELETE CASCADE,
    "bugId" INTEGER REFERENCES bugs(id) ON DELETE CASCADE,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "commentText" TEXT NOT NULL,
    "parentCommentId" INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    "isEdited" BOOLEAN DEFAULT FALSE,
    "editedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_comment_reference CHECK (
        "projectId" IS NOT NULL OR 
        "taskId" IS NOT NULL OR 
        "deliverableId" IS NOT NULL OR 
        "bugId" IS NOT NULL
    )
);

CREATE INDEX IF NOT EXISTS idx_comments_project ON comments("projectId");
CREATE INDEX IF NOT EXISTS idx_comments_task ON comments("taskId");
CREATE INDEX IF NOT EXISTS idx_comments_deliverable ON comments("deliverableId");
CREATE INDEX IF NOT EXISTS idx_comments_bug ON comments("bugId");
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments("userId");
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments("parentCommentId");
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments("createdAt" DESC);

CREATE OR REPLACE FUNCTION update_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    IF NEW."commentText" != OLD."commentText" THEN
        NEW."isEdited" = TRUE;
        NEW."editedAt" = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS comments_updated_at ON comments;
CREATE TRIGGER comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_comments_updated_at();

SELECT 'Migration 03 completed!' as message;

-- =====================================================
-- MIGRATION 04: Create Audit Trail Table
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_trail (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES users(id) ON DELETE SET NULL,
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

CREATE INDEX IF NOT EXISTS idx_audit_trail_user ON audit_trail("userId");
CREATE INDEX IF NOT EXISTS idx_audit_trail_action ON audit_trail("actionType");
CREATE INDEX IF NOT EXISTS idx_audit_trail_entity ON audit_trail("entityType", "entityId");
CREATE INDEX IF NOT EXISTS idx_audit_trail_timestamp ON audit_trail(timestamp DESC);

CREATE OR REPLACE FUNCTION log_audit_trail(
    p_user_id INTEGER,
    p_action_type VARCHAR(100),
    p_entity_type VARCHAR(100),
    p_entity_id INTEGER,
    p_old_value JSONB DEFAULT NULL,
    p_new_value JSONB DEFAULT NULL,
    p_ip_address VARCHAR(50) DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO audit_trail (
        "userId", "actionType", "entityType", "entityId", 
        "oldValue", "newValue", "ipAddress", "userAgent", description
    ) VALUES (
        p_user_id, p_action_type, p_entity_type, p_entity_id,
        p_old_value, p_new_value, p_ip_address, p_user_agent, p_description
    );
END;
$$ LANGUAGE plpgsql;

SELECT 'Migration 04 completed!' as message;

-- =====================================================
-- MIGRATION 05: Create Enhanced Approvals Table
-- =====================================================

CREATE TABLE IF NOT EXISTS approvals (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "projectId" INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    "stageId" INTEGER REFERENCES project_stages(id) ON DELETE CASCADE,
    "deliverableId" INTEGER REFERENCES deliverables(id) ON DELETE SET NULL,
    "taskId" INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
    "requestedBy" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "requestedTo" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "approvalType" VARCHAR(50) NOT NULL CHECK ("approvalType" IN (
        'design', 'code', 'deployment', 'deliverable', 
        'budget', 'timeline', 'stage_completion', 'other'
    )),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'rejected', 'cancelled', 'revision_requested'
    )),
    "relatedId" INTEGER,
    "relatedType" VARCHAR(50),
    comments TEXT,
    "rejectionReason" TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    "dueDate" TIMESTAMP,
    "requestedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP,
    "respondedBy" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_approvals_project ON approvals("projectId");
CREATE INDEX IF NOT EXISTS idx_approvals_stage ON approvals("stageId");
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_type ON approvals("approvalType");
CREATE INDEX IF NOT EXISTS idx_approvals_requested_by ON approvals("requestedBy");
CREATE INDEX IF NOT EXISTS idx_approvals_requested_to ON approvals("requestedTo");
CREATE INDEX IF NOT EXISTS idx_approvals_due_date ON approvals("dueDate");

CREATE OR REPLACE FUNCTION update_approvals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    IF NEW.status != OLD.status AND NEW.status != 'pending' THEN
        NEW."respondedAt" = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS approvals_updated_at ON approvals;
CREATE TRIGGER approvals_updated_at
    BEFORE UPDATE ON approvals
    FOR EACH ROW
    EXECUTE FUNCTION update_approvals_updated_at();

SELECT 'Migration 05 completed!' as message;

-- =====================================================
-- MIGRATION 06: Create Enhanced Notifications Table
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN (
        'info', 'success', 'warning', 'error', 
        'task', 'project', 'bug', 'approval', 
        'stage_transition', 'deadline', 'mention'
    )),
    "isRead" BOOLEAN DEFAULT FALSE,
    "readAt" TIMESTAMP,
    "relatedId" INTEGER,
    "relatedType" VARCHAR(50),
    link VARCHAR(500),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    "actionRequired" BOOLEAN DEFAULT FALSE,
    "expiresAt" TIMESTAMP,
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications("userId");
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications("isRead");
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_action_required ON notifications("actionRequired");

CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    IF NEW."isRead" = TRUE AND OLD."isRead" = FALSE THEN
        NEW."readAt" = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notifications_updated_at ON notifications;
CREATE TRIGGER notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();

CREATE OR REPLACE FUNCTION send_notification(
    p_user_id INTEGER,
    p_title VARCHAR(255),
    p_message TEXT,
    p_type VARCHAR(50) DEFAULT 'info',
    p_related_id INTEGER DEFAULT NULL,
    p_related_type VARCHAR(50) DEFAULT NULL,
    p_link VARCHAR(500) DEFAULT NULL,
    p_priority VARCHAR(20) DEFAULT 'normal',
    p_action_required BOOLEAN DEFAULT FALSE
)
RETURNS INTEGER AS $$
DECLARE
    v_notification_id INTEGER;
BEGIN
    INSERT INTO notifications (
        "userId", title, message, type, 
        "relatedId", "relatedType", link, 
        priority, "actionRequired"
    ) VALUES (
        p_user_id, p_title, p_message, p_type,
        p_related_id, p_related_type, p_link,
        p_priority, p_action_required
    ) RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

SELECT 'Migration 06 completed!' as message;

-- =====================================================
-- MIGRATION 07: Create Stage Transitions Table
-- =====================================================

CREATE TABLE IF NOT EXISTS stage_transitions (
    id SERIAL PRIMARY KEY,
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    "fromStage" VARCHAR(100),
    "toStage" VARCHAR(100) NOT NULL,
    "fromStageId" INTEGER REFERENCES project_stages(id) ON DELETE SET NULL,
    "toStageId" INTEGER REFERENCES project_stages(id) ON DELETE SET NULL,
    "transitionedBy" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    notes TEXT,
    "checklistCompleted" BOOLEAN DEFAULT FALSE,
    "approvalReceived" BOOLEAN DEFAULT FALSE,
    "approvalId" INTEGER REFERENCES approvals(id) ON DELETE SET NULL,
    metadata JSONB,
    "transitionedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stage_transitions_project ON stage_transitions("projectId");
CREATE INDEX IF NOT EXISTS idx_stage_transitions_from_stage ON stage_transitions("fromStageId");
CREATE INDEX IF NOT EXISTS idx_stage_transitions_to_stage ON stage_transitions("toStageId");
CREATE INDEX IF NOT EXISTS idx_stage_transitions_user ON stage_transitions("transitionedBy");
CREATE INDEX IF NOT EXISTS idx_stage_transitions_date ON stage_transitions("transitionedAt" DESC);

CREATE OR REPLACE FUNCTION transition_project_stage(
    p_project_id INTEGER,
    p_to_stage VARCHAR(100),
    p_user_id INTEGER,
    p_reason TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_current_stage VARCHAR(100);
    v_from_stage_id INTEGER;
    v_to_stage_id INTEGER;
    v_transition_id INTEGER;
BEGIN
    SELECT "currentStage" INTO v_current_stage FROM projects WHERE id = p_project_id;
    
    SELECT id INTO v_from_stage_id FROM project_stages
    WHERE "projectId" = p_project_id AND "stageName" = v_current_stage LIMIT 1;
    
    SELECT id INTO v_to_stage_id FROM project_stages
    WHERE "projectId" = p_project_id AND "stageName" = p_to_stage LIMIT 1;
    
    INSERT INTO stage_transitions (
        "projectId", "fromStage", "toStage", "fromStageId", "toStageId",
        "transitionedBy", reason, notes
    ) VALUES (
        p_project_id, v_current_stage, p_to_stage, v_from_stage_id, v_to_stage_id,
        p_user_id, p_reason, p_notes
    ) RETURNING id INTO v_transition_id;
    
    UPDATE projects SET "currentStage" = p_to_stage, "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = p_project_id;
    
    IF v_from_stage_id IS NOT NULL THEN
        UPDATE project_stages SET status = 'completed', "actualEndDate" = CURRENT_DATE,
            "progressPercentage" = 100, "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = v_from_stage_id;
    END IF;
    
    IF v_to_stage_id IS NOT NULL THEN
        UPDATE project_stages SET status = 'in_progress', "actualStartDate" = CURRENT_DATE,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = v_to_stage_id;
    END IF;
    
    RETURN v_transition_id;
END;
$$ LANGUAGE plpgsql;

SELECT 'Migration 07 completed!' as message;

-- =====================================================
-- MIGRATION 08: Create Task Checklists Table
-- =====================================================

CREATE TABLE IF NOT EXISTS task_checklists (
    id SERIAL PRIMARY KEY,
    "taskId" INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "isCompleted" BOOLEAN DEFAULT FALSE,
    "completedBy" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    "completedAt" TIMESTAMP,
    "orderIndex" INTEGER DEFAULT 0,
    "dueDate" TIMESTAMP,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_task_checklists_task ON task_checklists("taskId");
CREATE INDEX IF NOT EXISTS idx_task_checklists_completed ON task_checklists("isCompleted");
CREATE INDEX IF NOT EXISTS idx_task_checklists_order ON task_checklists("taskId", "orderIndex");

CREATE OR REPLACE FUNCTION update_task_checklists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    IF NEW."isCompleted" = TRUE AND OLD."isCompleted" = FALSE THEN
        NEW."completedAt" = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS task_checklists_updated_at ON task_checklists;
CREATE TRIGGER task_checklists_updated_at
    BEFORE UPDATE ON task_checklists
    FOR EACH ROW
    EXECUTE FUNCTION update_task_checklists_updated_at();

CREATE OR REPLACE FUNCTION calculate_task_completion(p_task_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    v_total INTEGER;
    v_completed INTEGER;
    v_percentage INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total FROM task_checklists WHERE "taskId" = p_task_id;
    IF v_total = 0 THEN RETURN 0; END IF;
    
    SELECT COUNT(*) INTO v_completed FROM task_checklists 
    WHERE "taskId" = p_task_id AND "isCompleted" = TRUE;
    
    v_percentage := ROUND((v_completed::DECIMAL / v_total::DECIMAL) * 100);
    RETURN v_percentage;
END;
$$ LANGUAGE plpgsql;

SELECT 'Migration 08 completed!' as message;

-- =====================================================
-- MIGRATION 09: Create Additional Supporting Tables
-- =====================================================

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    "senderId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "receiverId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "projectId" INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    "isRead" BOOLEAN DEFAULT FALSE,
    "readAt" TIMESTAMP,
    "attachmentUrl" VARCHAR(500),
    "parentMessageId" INTEGER REFERENCES messages(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages("senderId");
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages("receiverId");
CREATE INDEX IF NOT EXISTS idx_messages_project ON messages("projectId");
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages("isRead");
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages("createdAt" DESC);

CREATE TABLE IF NOT EXISTS calendar_events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP NOT NULL,
    "allDay" BOOLEAN DEFAULT FALSE,
    "eventType" VARCHAR(50) CHECK ("eventType" IN ('meeting', 'deadline', 'milestone', 'holiday', 'review', 'other')),
    "projectId" INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    "taskId" INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    "createdBy" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location VARCHAR(255),
    "meetingUrl" VARCHAR(500),
    "attendees" JSONB,
    "reminderMinutes" INTEGER DEFAULT 15,
    "isRecurring" BOOLEAN DEFAULT FALSE,
    "recurrenceRule" VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_project ON calendar_events("projectId");
CREATE INDEX IF NOT EXISTS idx_calendar_events_task ON calendar_events("taskId");
CREATE INDEX IF NOT EXISTS idx_calendar_events_created_by ON calendar_events("createdBy");
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_date ON calendar_events("startDate");
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON calendar_events("eventType");

CREATE TABLE IF NOT EXISTS workflow_states (
    id SERIAL PRIMARY KEY,
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    stage VARCHAR(100) NOT NULL CHECK (stage IN ('planning', 'design', 'development', 'testing', 'deployment', 'completed')),
    status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'blocked', 'on_hold')),
    "startedAt" TIMESTAMP,
    "completedAt" TIMESTAMP,
    "blockedReason" TEXT,
    notes TEXT,
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("projectId", stage)
);

CREATE INDEX IF NOT EXISTS idx_workflow_states_project ON workflow_states("projectId");
CREATE INDEX IF NOT EXISTS idx_workflow_states_stage ON workflow_states(stage);
CREATE INDEX IF NOT EXISTS idx_workflow_states_status ON workflow_states(status);

CREATE TABLE IF NOT EXISTS file_attachments (
    id SERIAL PRIMARY KEY,
    "fileName" VARCHAR(255) NOT NULL,
    "filePath" VARCHAR(500) NOT NULL,
    "fileSize" BIGINT,
    "fileType" VARCHAR(100),
    "mimeType" VARCHAR(100),
    "uploadedBy" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_file_attachments_uploaded_by ON file_attachments("uploadedBy");
CREATE INDEX IF NOT EXISTS idx_file_attachments_project ON file_attachments("projectId");
CREATE INDEX IF NOT EXISTS idx_file_attachments_task ON file_attachments("taskId");
CREATE INDEX IF NOT EXISTS idx_file_attachments_created ON file_attachments("createdAt" DESC);

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS messages_updated_at ON messages;
CREATE TRIGGER messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS calendar_events_updated_at ON calendar_events;
CREATE TRIGGER calendar_events_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS workflow_states_updated_at ON workflow_states;
CREATE TRIGGER workflow_states_updated_at BEFORE UPDATE ON workflow_states FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS file_attachments_updated_at ON file_attachments;
CREATE TRIGGER file_attachments_updated_at BEFORE UPDATE ON file_attachments FOR EACH ROW EXECUTE FUNCTION update_timestamp();

SELECT 'Migration 09 completed!' as message;

-- =====================================================
-- MIGRATION 10: Create Initial Project Stages
-- =====================================================

CREATE OR REPLACE FUNCTION create_default_project_stages(p_project_id INTEGER)
RETURNS void AS $$
BEGIN
    INSERT INTO project_stages ("projectId", "stageNumber", "stageName", status, "progressPercentage")
    VALUES (p_project_id, 1, 'UI/UX Design', 'not_started', 0)
    ON CONFLICT ("projectId", "stageNumber") DO NOTHING;
    
    INSERT INTO project_stages ("projectId", "stageNumber", "stageName", status, "progressPercentage")
    VALUES (p_project_id, 2, 'Development', 'not_started', 0)
    ON CONFLICT ("projectId", "stageNumber") DO NOTHING;
    
    INSERT INTO project_stages ("projectId", "stageNumber", "stageName", status, "progressPercentage")
    VALUES (p_project_id, 3, 'Testing', 'not_started', 0)
    ON CONFLICT ("projectId", "stageNumber") DO NOTHING;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    project_record RECORD;
BEGIN
    FOR project_record IN SELECT id FROM projects
    LOOP
        PERFORM create_default_project_stages(project_record.id);
    END LOOP;
END $$;

CREATE OR REPLACE FUNCTION auto_create_project_stages()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM create_default_project_stages(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_create_project_stages ON projects;
CREATE TRIGGER trigger_auto_create_project_stages
    AFTER INSERT ON projects
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_project_stages();

UPDATE projects SET "currentStage" = 'ui_ux' WHERE "currentStage" IS NULL;

SELECT 'Migration 10 completed!' as message;

-- =====================================================
-- MIGRATION 11: Create Views and Helper Functions
-- =====================================================

CREATE OR REPLACE VIEW project_dashboard_summary AS
SELECT 
    p.id as project_id, p.name as project_name, p."currentStage", p.status, p.priority,
    p."startDate", p."endDate", p.budget, u.name as client_name, pm.name as project_manager_name,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
    ps1.status as uiux_status, ps1."progressPercentage" as uiux_progress,
    ps2.status as dev_status, ps2."progressPercentage" as dev_progress,
    ps3.status as testing_status, ps3."progressPercentage" as testing_progress
FROM projects p
LEFT JOIN users u ON p."clientId" = u.id
LEFT JOIN users pm ON p."projectManagerId" = pm.id
LEFT JOIN tasks t ON p.id = t."projectId"
LEFT JOIN project_stages ps1 ON p.id = ps1."projectId" AND ps1."stageNumber" = 1
LEFT JOIN project_stages ps2 ON p.id = ps2."projectId" AND ps2."stageNumber" = 2
LEFT JOIN project_stages ps3 ON p.id = ps3."projectId" AND ps3."stageNumber" = 3
GROUP BY p.id, u.name, pm.name, ps1.status, ps1."progressPercentage", 
         ps2.status, ps2."progressPercentage", ps3.status, ps3."progressPercentage";

CREATE OR REPLACE VIEW user_workload_summary AS
SELECT 
    u.id as user_id, u.name as user_name, u.role, u.department,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'in_progress' THEN t.id END) as active_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'blocked' THEN t.id END) as blocked_tasks,
    COUNT(DISTINCT t."projectId") as projects_involved,
    COALESCE(SUM(t."estimatedHours"), 0) as total_estimated_hours,
    COALESCE(SUM(t."actualHours"), 0) as total_actual_hours
FROM users u
LEFT JOIN tasks t ON u.id = t."assignedTo"
WHERE u.role IN ('developer', 'designer', 'tester')
GROUP BY u.id;

CREATE OR REPLACE VIEW pending_approvals_summary AS
SELECT 
    a.id as approval_id, a.title, a."approvalType", a.priority, a."dueDate", a."requestedAt",
    p.name as project_name, requester.name as requested_by_name, approver.name as requested_to_name,
    a.status,
    CASE 
        WHEN a."dueDate" < CURRENT_TIMESTAMP THEN 'overdue'
        WHEN a."dueDate" < CURRENT_TIMESTAMP + INTERVAL '24 hours' THEN 'due_soon'
        ELSE 'on_time'
    END as urgency_status
FROM approvals a
LEFT JOIN projects p ON a."projectId" = p.id
LEFT JOIN users requester ON a."requestedBy" = requester.id
LEFT JOIN users approver ON a."requestedTo" = approver.id
WHERE a.status = 'pending';

CREATE OR REPLACE VIEW bug_statistics AS
SELECT 
    p.id as project_id, p.name as project_name,
    COUNT(b.id) as total_bugs,
    COUNT(CASE WHEN b.severity = 'critical' THEN 1 END) as critical_bugs,
    COUNT(CASE WHEN b.severity = 'high' THEN 1 END) as high_bugs,
    COUNT(CASE WHEN b.severity = 'medium' THEN 1 END) as medium_bugs,
    COUNT(CASE WHEN b.severity = 'low' THEN 1 END) as low_bugs,
    COUNT(CASE WHEN b.status = 'open' THEN 1 END) as open_bugs,
    COUNT(CASE WHEN b.status = 'in_progress' THEN 1 END) as in_progress_bugs,
    COUNT(CASE WHEN b.status = 'resolved' THEN 1 END) as resolved_bugs,
    COUNT(CASE WHEN b.status = 'closed' THEN 1 END) as closed_bugs
FROM projects p
LEFT JOIN bugs b ON p.id = b."projectId"
GROUP BY p.id;

CREATE OR REPLACE FUNCTION get_project_progress(p_project_id INTEGER)
RETURNS INTEGER AS $$
DECLARE v_total_tasks INTEGER; v_completed_tasks INTEGER; v_progress INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total_tasks FROM tasks WHERE "projectId" = p_project_id;
    IF v_total_tasks = 0 THEN RETURN 0; END IF;
    SELECT COUNT(*) INTO v_completed_tasks FROM tasks WHERE "projectId" = p_project_id AND status = 'completed';
    v_progress := ROUND((v_completed_tasks::DECIMAL / v_total_tasks::DECIMAL) * 100);
    RETURN v_progress;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_overdue_tasks_count(p_user_id INTEGER DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE v_count INTEGER;
BEGIN
    IF p_user_id IS NULL THEN
        SELECT COUNT(*) INTO v_count FROM tasks WHERE "dueDate" < CURRENT_DATE AND status NOT IN ('completed', 'cancelled');
    ELSE
        SELECT COUNT(*) INTO v_count FROM tasks WHERE "assignedTo" = p_user_id AND "dueDate" < CURRENT_DATE AND status NOT IN ('completed', 'cancelled');
    END IF;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_team_availability()
RETURNS TABLE (user_id INTEGER, user_name VARCHAR(255), role VARCHAR(50), active_tasks_count BIGINT, workload_percentage INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.name, u.role, COUNT(t.id) as active_tasks_count,
        CASE 
            WHEN COUNT(t.id) = 0 THEN 0
            WHEN COUNT(t.id) <= 3 THEN 30
            WHEN COUNT(t.id) <= 5 THEN 60
            WHEN COUNT(t.id) <= 7 THEN 85
            ELSE 100
        END as workload_percentage
    FROM users u
    LEFT JOIN tasks t ON u.id = t."assignedTo" AND t.status IN ('todo', 'in_progress')
    WHERE u.role IN ('developer', 'designer', 'tester') AND u.status = 'active'
    GROUP BY u.id, u.name, u.role
    ORDER BY active_tasks_count ASC;
END;
$$ LANGUAGE plpgsql;

SELECT 'Migration 11 completed!' as message;

-- =====================================================
-- FINAL SUCCESS MESSAGE
-- =====================================================

SELECT '🎉 ALL MIGRATIONS COMPLETED SUCCESSFULLY! 🎉' as message;
SELECT 'Database schema has been updated to match documentation requirements.' as status;
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
SELECT COUNT(*) as total_views FROM pg_views WHERE schemaname = 'public';
SELECT COUNT(*) as total_functions FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
