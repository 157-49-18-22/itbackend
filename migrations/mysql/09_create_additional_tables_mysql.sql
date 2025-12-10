-- =====================================================
-- Migration 09: Create Additional Supporting Tables (MySQL)
-- Purpose: Messages, Calendar Events, and Workflow States
-- Run this AFTER migration 08
-- =====================================================

-- 1. Create Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    senderId INT NOT NULL,
    receiverId INT NOT NULL,
    projectId INT,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    isRead BOOLEAN DEFAULT FALSE,
    readAt TIMESTAMP NULL,
    attachmentUrl VARCHAR(500),
    parentMessageId INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiverId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY (parentMessageId) REFERENCES messages(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_messages_sender ON messages(senderId);
CREATE INDEX idx_messages_receiver ON messages(receiverId);
CREATE INDEX idx_messages_project ON messages(projectId);
CREATE INDEX idx_messages_read ON messages(isRead);
CREATE INDEX idx_messages_created ON messages(createdAt DESC);

-- 2. Create Calendar Events Table
CREATE TABLE IF NOT EXISTS calendar_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    startDate TIMESTAMP NOT NULL,
    endDate TIMESTAMP NOT NULL,
    allDay BOOLEAN DEFAULT FALSE,
    eventType VARCHAR(50) CHECK (eventType IN ('meeting', 'deadline', 'milestone', 'holiday', 'review', 'other')),
    projectId INT,
    taskId INT,
    createdBy INT NOT NULL,
    location VARCHAR(255),
    meetingUrl VARCHAR(500),
    attendees JSON,
    reminderMinutes INT DEFAULT 15,
    isRecurring BOOLEAN DEFAULT FALSE,
    recurrenceRule VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_calendar_events_project ON calendar_events(projectId);
CREATE INDEX idx_calendar_events_task ON calendar_events(taskId);
CREATE INDEX idx_calendar_events_created_by ON calendar_events(createdBy);
CREATE INDEX idx_calendar_events_start_date ON calendar_events(startDate);
CREATE INDEX idx_calendar_events_type ON calendar_events(eventType);

-- 3. Create Workflow States Table
CREATE TABLE IF NOT EXISTS workflow_states (
    id INT AUTO_INCREMENT PRIMARY KEY,
    projectId INT NOT NULL,
    stage VARCHAR(100) NOT NULL CHECK (stage IN ('planning', 'design', 'development', 'testing', 'deployment', 'completed')),
    status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'blocked', 'on_hold')),
    startedAt TIMESTAMP NULL,
    completedAt TIMESTAMP NULL,
    blockedReason TEXT,
    notes TEXT,
    metadata JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_project_workflow (projectId, stage),
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_workflow_states_project ON workflow_states(projectId);
CREATE INDEX idx_workflow_states_stage ON workflow_states(stage);
CREATE INDEX idx_workflow_states_status ON workflow_states(status);

-- 4. Create File Attachments Table
CREATE TABLE IF NOT EXISTS file_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fileName VARCHAR(255) NOT NULL,
    filePath VARCHAR(500) NOT NULL,
    fileSize BIGINT,
    fileType VARCHAR(100),
    mimeType VARCHAR(100),
    uploadedBy INT NOT NULL,
    projectId INT,
    taskId INT,
    commentId INT,
    messageId INT,
    description TEXT,
    isPublic BOOLEAN DEFAULT FALSE,
    downloadCount INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (uploadedBy) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (commentId) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (messageId) REFERENCES messages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_file_attachments_uploaded_by ON file_attachments(uploadedBy);
CREATE INDEX idx_file_attachments_project ON file_attachments(projectId);
CREATE INDEX idx_file_attachments_task ON file_attachments(taskId);
CREATE INDEX idx_file_attachments_created ON file_attachments(createdAt DESC);

-- Success message
SELECT 'Migration 09 completed: Additional supporting tables created successfully!' as message;
