-- =====================================================
-- Migration 06: Create Enhanced Notifications Table (MySQL)
-- Purpose: Comprehensive notification system
-- Run this AFTER migration 05
-- =====================================================

-- Create Enhanced Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN (
        'info', 'success', 'warning', 'error', 
        'task', 'project', 'bug', 'approval', 
        'stage_transition', 'deadline', 'mention'
    )),
    isRead BOOLEAN DEFAULT FALSE,
    readAt TIMESTAMP NULL,
    relatedId INT,
    relatedType VARCHAR(50),
    link VARCHAR(500),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    actionRequired BOOLEAN DEFAULT FALSE,
    expiresAt TIMESTAMP NULL,
    metadata JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create indexes for better performance
CREATE INDEX idx_notifications_user ON notifications(userId);
CREATE INDEX idx_notifications_read ON notifications(isRead);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_created ON notifications(createdAt DESC);
CREATE INDEX idx_notifications_action_required ON notifications(actionRequired);

-- Success message
SELECT 'Migration 06 completed: Enhanced Notifications table created successfully!' as message;
