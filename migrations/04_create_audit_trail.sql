-- =====================================================
-- Migration 04: Create Audit Trail Table
-- Purpose: Track all system activities for security and compliance
-- Run this AFTER migration 03
-- =====================================================

-- Create Audit Trail Table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_trail_user ON audit_trail("userId");
CREATE INDEX IF NOT EXISTS idx_audit_trail_action ON audit_trail("actionType");
CREATE INDEX IF NOT EXISTS idx_audit_trail_entity ON audit_trail("entityType", "entityId");
CREATE INDEX IF NOT EXISTS idx_audit_trail_timestamp ON audit_trail(timestamp DESC);

-- Create function to log audit trail
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
        "userId", 
        "actionType", 
        "entityType", 
        "entityId", 
        "oldValue", 
        "newValue", 
        "ipAddress", 
        "userAgent",
        description
    ) VALUES (
        p_user_id,
        p_action_type,
        p_entity_type,
        p_entity_id,
        p_old_value,
        p_new_value,
        p_ip_address,
        p_user_agent,
        p_description
    );
END;
$$ LANGUAGE plpgsql;

-- Success message
SELECT 'Migration 04 completed: Audit Trail table created successfully!' as message;
