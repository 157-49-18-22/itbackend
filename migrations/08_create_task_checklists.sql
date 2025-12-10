-- =====================================================
-- Migration 08: Create Task Checklists Table
-- Purpose: Enable checklist items for tasks
-- Run this AFTER migration 07
-- =====================================================

-- Drop existing task_checklists table if it exists
-- DROP TABLE IF EXISTS task_checklists CASCADE;

-- Create Task Checklists Table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_task_checklists_task ON task_checklists("taskId");
CREATE INDEX IF NOT EXISTS idx_task_checklists_completed ON task_checklists("isCompleted");
CREATE INDEX IF NOT EXISTS idx_task_checklists_order ON task_checklists("taskId", "orderIndex");

-- Create trigger to update updatedAt timestamp
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

-- Create function to calculate task completion percentage
CREATE OR REPLACE FUNCTION calculate_task_completion(p_task_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    v_total INTEGER;
    v_completed INTEGER;
    v_percentage INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total
    FROM task_checklists
    WHERE "taskId" = p_task_id;
    
    IF v_total = 0 THEN
        RETURN 0;
    END IF;
    
    SELECT COUNT(*) INTO v_completed
    FROM task_checklists
    WHERE "taskId" = p_task_id AND "isCompleted" = TRUE;
    
    v_percentage := ROUND((v_completed::DECIMAL / v_total::DECIMAL) * 100);
    
    RETURN v_percentage;
END;
$$ LANGUAGE plpgsql;

-- Success message
SELECT 'Migration 08 completed: Task Checklists table created successfully!' as message;
