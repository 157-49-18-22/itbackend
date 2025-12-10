-- =====================================================
-- Migration 02: Create Project Stages Table
-- Purpose: Track three-stage workflow (UI/UX, Development, Testing)
-- Run this AFTER migration 01
-- =====================================================

-- Create Project Stages Table
CREATE TABLE IF NOT EXISTS project_stages (
    id SERIAL PRIMARY KEY,
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    "stageNumber" INTEGER NOT NULL CHECK ("stageNumber" IN (1, 2, 3)),
    "stageName" VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'blocked')),
    "startDate" DATE,
    "endDate" DATE,
    "actualStartDate" DATE,
    "actualEndDate" DATE,
    "progressPercentage" INTEGER DEFAULT 0 CHECK ("progressPercentage" >= 0 AND "progressPercentage" <= 100),
    "assignedTeamLead" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("projectId", "stageNumber")
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_project_stages_project ON project_stages("projectId");
CREATE INDEX IF NOT EXISTS idx_project_stages_status ON project_stages(status);

-- Add foreign key constraint to tasks table for stageId
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_stageid_fkey;
ALTER TABLE tasks ADD CONSTRAINT tasks_stageid_fkey 
    FOREIGN KEY ("stageId") REFERENCES project_stages(id) ON DELETE SET NULL;

-- Create trigger to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_project_stages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS project_stages_updated_at ON project_stages;
CREATE TRIGGER project_stages_updated_at
    BEFORE UPDATE ON project_stages
    FOR EACH ROW
    EXECUTE FUNCTION update_project_stages_updated_at();

-- Success message
SELECT 'Migration 02 completed: Project Stages table created successfully!' as message;
