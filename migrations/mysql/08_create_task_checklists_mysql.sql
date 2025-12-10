-- =====================================================
-- Migration 08: Create Task Checklists Table (MySQL)
-- Purpose: Enable checklist items for tasks
-- Run this AFTER migration 07
-- =====================================================

-- Create Task Checklists Table
CREATE TABLE IF NOT EXISTS task_checklists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    taskId INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    isCompleted BOOLEAN DEFAULT FALSE,
    completedBy INT,
    completedAt TIMESTAMP NULL,
    orderIndex INT DEFAULT 0,
    dueDate TIMESTAMP NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (completedBy) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create indexes for better performance
CREATE INDEX idx_task_checklists_task ON task_checklists(taskId);
CREATE INDEX idx_task_checklists_completed ON task_checklists(isCompleted);
CREATE INDEX idx_task_checklists_order ON task_checklists(taskId, orderIndex);

-- Success message
SELECT 'Migration 08 completed: Task Checklists table created successfully!' as message;
