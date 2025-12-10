-- =====================================================
-- Migration 04: Create Audit Trail Table (MySQL)
-- Purpose: Track all system activities for security and compliance
-- Run this AFTER migration 03
-- =====================================================

-- Create Audit Trail Table
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

-- Create indexes for better performance
CREATE INDEX idx_audit_trail_user ON audit_trail(userId);
CREATE INDEX idx_audit_trail_action ON audit_trail(actionType);
CREATE INDEX idx_audit_trail_entity ON audit_trail(entityType, entityId);
CREATE INDEX idx_audit_trail_timestamp ON audit_trail(timestamp DESC);

-- Success message
SELECT 'Migration 04 completed: Audit Trail table created successfully!' as message;
