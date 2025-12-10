-- =====================================================
-- COMPLETE MySQL MIGRATIONS - ALL IN ONE FILE
-- Purpose: All 10 migrations combined for easy execution
-- Database: MySQL 8.0+
-- NOTE: Ignore "Duplicate" errors - they're safe!
-- =====================================================

-- =====================================================
-- Migration 01: Update Existing Tables
-- =====================================================

ALTER TABLE projects ADD COLUMN currentStage VARCHAR(50) DEFAULT 'ui_ux';
ALTER TABLE projects ADD COLUMN actualEndDate DATE;
ALTER TABLE projects ADD COLUMN projectType VARCHAR(100);
ALTER TABLE projects ADD COLUMN category VARCHAR(100);
ALTER TABLE projects ADD COLUMN projectManagerId INT;

ALTER TABLE tasks ADD COLUMN stageId INT;
ALTER TABLE tasks ADD COLUMN dependencies JSON;
ALTER TABLE tasks ADD COLUMN completionDate TIMESTAMP NULL;
ALTER TABLE tasks ADD COLUMN orderIndex INT DEFAULT 0;

ALTER TABLE users ADD COLUMN fullName VARCHAR(255);
ALTER TABLE users ADD COLUMN profileImage VARCHAR(500);
ALTER TABLE users ADD COLUMN lastLogin TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN department VARCHAR(100);

ALTER TABLE deliverables ADD COLUMN version VARCHAR(50) DEFAULT '1.0';
ALTER TABLE deliverables ADD COLUMN approvalStatus VARCHAR(50) DEFAULT 'pending';
ALTER TABLE deliverables ADD COLUMN approvedBy INT;
ALTER TABLE deliverables ADD COLUMN approvedAt TIMESTAMP NULL;

ALTER TABLE bugs ADD COLUMN environment VARCHAR(100);
ALTER TABLE bugs ADD COLUMN browserInfo VARCHAR(255);
ALTER TABLE bugs ADD COLUMN deviceInfo VARCHAR(255);
ALTER TABLE bugs ADD COLUMN screenshotUrl VARCHAR(500);
ALTER TABLE bugs ADD COLUMN resolvedAt TIMESTAMP NULL;
ALTER TABLE bugs ADD COLUMN resolvedBy INT;

ALTER TABLE test_cases ADD COLUMN executedBy INT;
ALTER TABLE test_cases ADD COLUMN executionDate TIMESTAMP NULL;
ALTER TABLE test_cases ADD COLUMN actualResult TEXT;
ALTER TABLE test_cases ADD COLUMN attachmentUrl VARCHAR(500);

ALTER TABLE sprints ADD COLUMN velocity INT DEFAULT 0;
ALTER TABLE sprints ADD COLUMN completedPoints INT DEFAULT 0;
ALTER TABLE sprints ADD COLUMN totalPoints INT DEFAULT 0;

SELECT '✅ Migration 01 completed!' as status;

-- =====================================================
-- Migration 02: Create Project Stages Table
-- =====================================================

CREATE TABLE IF NOT EXISTS project_stages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    projectId INT NOT NULL,
    stageNumber INT NOT NULL,
    stageName VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'not_started',
    startDate DATE,
    endDate DATE,
    actualStartDate DATE,
    actualEndDate DATE,
    progressPercentage INT DEFAULT 0,
    assignedTeamLead INT,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_project_stage (projectId, stageNumber),
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assignedTeamLead) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_project_stages_project ON project_stages(projectId);
CREATE INDEX idx_project_stages_status ON project_stages(status);

SELECT '✅ Migration 02 completed!' as status;

-- =====================================================
-- Migration 03: Create Comments Table
-- =====================================================

CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    projectId INT,
    taskId INT,
    deliverableId INT,
    bugId INT,
    userId INT NOT NULL,
    commentText TEXT NOT NULL,
    parentCommentId INT,
    isEdited BOOLEAN DEFAULT FALSE,
    editedAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (deliverableId) REFERENCES deliverables(id) ON DELETE CASCADE,
    FOREIGN KEY (bugId) REFERENCES bugs(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parentCommentId) REFERENCES comments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_comments_project ON comments(projectId);
CREATE INDEX idx_comments_task ON comments(taskId);
CREATE INDEX idx_comments_deliverable ON comments(deliverableId);
CREATE INDEX idx_comments_bug ON comments(bugId);
CREATE INDEX idx_comments_user ON comments(userId);

SELECT '✅ Migration 03 completed!' as status;

-- =====================================================
-- Migration 04: Create Audit Trail Table
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_trail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    actionType VARCHAR(100) NOT NULL,
    entityType VARCHAR(100) NOT NULL,
    entityId INT,
    oldValue JSON,
    newValue JSON,
    ipAddress VARCHAR(50),
    userAgent TEXT,
    description TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_audit_trail_user ON audit_trail(userId);
CREATE INDEX idx_audit_trail_action ON audit_trail(actionType);
CREATE INDEX idx_audit_trail_timestamp ON audit_trail(timestamp);

SELECT '✅ Migration 04 completed!' as status;

-- =====================================================
-- Migration 05: Create Enhanced Approvals Table
-- =====================================================

CREATE TABLE IF NOT EXISTS approvals_new (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    projectId INT,
    stageId INT,
    deliverableId INT,
    taskId INT,
    requestedBy INT NOT NULL,
    requestedTo INT NOT NULL,
    approvalType VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    relatedId INT,
    relatedType VARCHAR(50),
    comments TEXT,
    rejectionReason TEXT,
    priority VARCHAR(20) DEFAULT 'medium',
    dueDate TIMESTAMP NULL,
    requestedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    respondedAt TIMESTAMP NULL,
    respondedBy INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (stageId) REFERENCES project_stages(id) ON DELETE CASCADE,
    FOREIGN KEY (deliverableId) REFERENCES deliverables(id) ON DELETE SET NULL,
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE SET NULL,
    FOREIGN KEY (requestedBy) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (requestedTo) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (respondedBy) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_approvals_new_project ON approvals_new(projectId);
CREATE INDEX idx_approvals_new_status ON approvals_new(status);

SELECT '✅ Migration 05 completed!' as status;

-- =====================================================
-- Migration 06: Create Enhanced Notifications Table
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications_new (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    isRead BOOLEAN DEFAULT FALSE,
    readAt TIMESTAMP NULL,
    relatedId INT,
    relatedType VARCHAR(50),
    link VARCHAR(500),
    priority VARCHAR(20) DEFAULT 'normal',
    actionRequired BOOLEAN DEFAULT FALSE,
    expiresAt TIMESTAMP NULL,
    metadata JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_notifications_new_user ON notifications_new(userId);
CREATE INDEX idx_notifications_new_read ON notifications_new(isRead);
CREATE INDEX idx_notifications_new_type ON notifications_new(type);

SELECT '✅ Migration 06 completed!' as status;

-- =====================================================
-- Migration 07: Create Stage Transitions Table
-- =====================================================

CREATE TABLE IF NOT EXISTS stage_transitions_new (
    id INT AUTO_INCREMENT PRIMARY KEY,
    projectId INT NOT NULL,
    fromStage VARCHAR(100),
    toStage VARCHAR(100) NOT NULL,
    fromStageId INT,
    toStageId INT,
    transitionedBy INT NOT NULL,
    reason TEXT,
    notes TEXT,
    checklistCompleted BOOLEAN DEFAULT FALSE,
    approvalReceived BOOLEAN DEFAULT FALSE,
    approvalId INT,
    metadata JSON,
    transitionedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (fromStageId) REFERENCES project_stages(id) ON DELETE SET NULL,
    FOREIGN KEY (toStageId) REFERENCES project_stages(id) ON DELETE SET NULL,
    FOREIGN KEY (transitionedBy) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_stage_transitions_new_project ON stage_transitions_new(projectId);

SELECT '✅ Migration 07 completed!' as status;

-- =====================================================
-- Migration 08: Create Task Checklists Table
-- =====================================================

CREATE TABLE IF NOT EXISTS task_checklists_new (
    id INT AUTO_INCREMENT PRIMARY KEY,
    taskId INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    isCompleted BOOLEAN DEFAULT FALSE,
    completedBy INT,
    completedAt TIMESTAMP NULL,
    orderIndex INT DEFAULT 0,
    dueDate TIMESTAMP NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (completedBy) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_task_checklists_new_task ON task_checklists_new(taskId);

SELECT '✅ Migration 08 completed!' as status;

-- =====================================================
-- Migration 09: Create Additional Tables
-- =====================================================

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

CREATE TABLE IF NOT EXISTS calendar_events_new (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    startDate TIMESTAMP NOT NULL,
    endDate TIMESTAMP NOT NULL,
    allDay BOOLEAN DEFAULT FALSE,
    eventType VARCHAR(50),
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

CREATE TABLE IF NOT EXISTS workflow_states (
    id INT AUTO_INCREMENT PRIMARY KEY,
    projectId INT NOT NULL,
    stage VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'not_started',
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

SELECT '✅ Migration 09 completed!' as status;

-- =====================================================
-- Migration 10: Initialize Project Stages
-- =====================================================

-- Add foreign key for tasks.stageId
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_stageid 
FOREIGN KEY (stageId) REFERENCES project_stages(id) ON DELETE SET NULL;

-- Create stages for existing projects
INSERT IGNORE INTO project_stages (projectId, stageNumber, stageName, status, progressPercentage)
SELECT id, 1, 'UI/UX Design', 'not_started', 0 FROM projects;

INSERT IGNORE INTO project_stages (projectId, stageNumber, stageName, status, progressPercentage)
SELECT id, 2, 'Development', 'not_started', 0 FROM projects;

INSERT IGNORE INTO project_stages (projectId, stageNumber, stageName, status, progressPercentage)
SELECT id, 3, 'Testing', 'not_started', 0 FROM projects;

-- Update projects currentStage
UPDATE projects SET currentStage = 'ui_ux' WHERE currentStage IS NULL;

SELECT '✅ Migration 10 completed!' as status;

-- =====================================================
-- FINAL SUCCESS MESSAGE
-- =====================================================

SELECT '🎉 ALL MIGRATIONS COMPLETED SUCCESSFULLY! 🎉' as message;
SELECT COUNT(*) as total_tables FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE';
SELECT COUNT(*) as total_stages_created FROM project_stages;
