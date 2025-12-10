-- =====================================================
-- Migration 06: Create/Update Notifications Table
-- Purpose: Comprehensive notification system
-- Run this AFTER migration 05
-- =====================================================

-- Drop existing notifications table if it exists (to recreate with new structure)
-- Comment this out if you want to keep existing data
-- DROP TABLE IF EXISTS notifications CASCADE;

-- Create Enhanced Notifications Table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications("userId");
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications("isRead");
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_action_required ON notifications("actionRequired");

-- Create trigger to update updatedAt timestamp
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

-- Create function to send notification
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

-- Success message
SELECT 'Migration 06 completed: Enhanced Notifications table created successfully!' as message;
