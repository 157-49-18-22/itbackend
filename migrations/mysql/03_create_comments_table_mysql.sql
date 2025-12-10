-- =====================================================
-- Migration 03: Create Comments Table (MySQL)
-- Purpose: Enable commenting on projects, tasks, and deliverables
-- Run this AFTER migration 02
-- =====================================================

-- Create Comments Table
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
    FOREIGN KEY (parentCommentId) REFERENCES comments(id) ON DELETE CASCADE,
    CHECK (projectId IS NOT NULL OR taskId IS NOT NULL OR deliverableId IS NOT NULL OR bugId IS NOT NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create indexes for better performance
CREATE INDEX idx_comments_project ON comments(projectId);
CREATE INDEX idx_comments_task ON comments(taskId);
CREATE INDEX idx_comments_deliverable ON comments(deliverableId);
CREATE INDEX idx_comments_bug ON comments(bugId);
CREATE INDEX idx_comments_user ON comments(userId);
CREATE INDEX idx_comments_parent ON comments(parentCommentId);
CREATE INDEX idx_comments_created ON comments(createdAt DESC);

-- Success message
SELECT 'Migration 03 completed: Comments table created successfully!' as message;
