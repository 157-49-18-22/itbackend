-- =====================================================
-- Migration 09: Create Additional Supporting Tables
-- Purpose: Messages, Calendar Events, and Workflow States
-- Run this AFTER migration 08
-- =====================================================

-- 1. Create Messages Table
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

-- Create indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages("senderId");
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages("receiverId");
CREATE INDEX IF NOT EXISTS idx_messages_project ON messages("projectId");
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages("isRead");
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages("createdAt" DESC);

-- 2. Create Calendar Events Table
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

-- Create indexes for calendar events
CREATE INDEX IF NOT EXISTS idx_calendar_events_project ON calendar_events("projectId");
CREATE INDEX IF NOT EXISTS idx_calendar_events_task ON calendar_events("taskId");
CREATE INDEX IF NOT EXISTS idx_calendar_events_created_by ON calendar_events("createdBy");
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_date ON calendar_events("startDate");
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON calendar_events("eventType");

-- 3. Create Workflow States Table
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

-- Create indexes for workflow states
CREATE INDEX IF NOT EXISTS idx_workflow_states_project ON workflow_states("projectId");
CREATE INDEX IF NOT EXISTS idx_workflow_states_stage ON workflow_states(stage);
CREATE INDEX IF NOT EXISTS idx_workflow_states_status ON workflow_states(status);

-- 4. Create File Attachments Table
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

-- Create indexes for file attachments
CREATE INDEX IF NOT EXISTS idx_file_attachments_uploaded_by ON file_attachments("uploadedBy");
CREATE INDEX IF NOT EXISTS idx_file_attachments_project ON file_attachments("projectId");
CREATE INDEX IF NOT EXISTS idx_file_attachments_task ON file_attachments("taskId");
CREATE INDEX IF NOT EXISTS idx_file_attachments_created ON file_attachments("createdAt" DESC);

-- Create triggers for updatedAt
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS messages_updated_at ON messages;
CREATE TRIGGER messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS calendar_events_updated_at ON calendar_events;
CREATE TRIGGER calendar_events_updated_at
    BEFORE UPDATE ON calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS workflow_states_updated_at ON workflow_states;
CREATE TRIGGER workflow_states_updated_at
    BEFORE UPDATE ON workflow_states
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS file_attachments_updated_at ON file_attachments;
CREATE TRIGGER file_attachments_updated_at
    BEFORE UPDATE ON file_attachments
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Success message
SELECT 'Migration 09 completed: Additional supporting tables created successfully!' as message;
