-- =====================================================
-- Migration 10: Create Initial Project Stages for Existing Projects
-- Purpose: Automatically create 3 stages for all existing projects
-- Run this AFTER migration 09
-- =====================================================

-- Function to create default stages for a project
CREATE OR REPLACE FUNCTION create_default_project_stages(p_project_id INTEGER)
RETURNS void AS $$
BEGIN
    -- Stage 1: UI/UX Design
    INSERT INTO project_stages (
        "projectId", "stageNumber", "stageName", status, "progressPercentage"
    ) VALUES (
        p_project_id, 1, 'UI/UX Design', 'not_started', 0
    ) ON CONFLICT ("projectId", "stageNumber") DO NOTHING;
    
    -- Stage 2: Development
    INSERT INTO project_stages (
        "projectId", "stageNumber", "stageName", status, "progressPercentage"
    ) VALUES (
        p_project_id, 2, 'Development', 'not_started', 0
    ) ON CONFLICT ("projectId", "stageNumber") DO NOTHING;
    
    -- Stage 3: Testing
    INSERT INTO project_stages (
        "projectId", "stageNumber", "stageName", status, "progressPercentage"
    ) VALUES (
        p_project_id, 3, 'Testing', 'not_started', 0
    ) ON CONFLICT ("projectId", "stageNumber") DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Create stages for all existing projects
DO $$
DECLARE
    project_record RECORD;
BEGIN
    FOR project_record IN SELECT id FROM projects
    LOOP
        PERFORM create_default_project_stages(project_record.id);
    END LOOP;
END $$;

-- Create trigger to automatically create stages for new projects
CREATE OR REPLACE FUNCTION auto_create_project_stages()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM create_default_project_stages(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_create_project_stages ON projects;
CREATE TRIGGER trigger_auto_create_project_stages
    AFTER INSERT ON projects
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_project_stages();

-- Update existing projects to set currentStage if NULL
UPDATE projects
SET "currentStage" = 'ui_ux'
WHERE "currentStage" IS NULL;

-- Success message
SELECT 'Migration 10 completed: Initial project stages created for all projects!' as message;
SELECT COUNT(*) as total_stages_created FROM project_stages;
