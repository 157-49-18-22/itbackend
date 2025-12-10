-- =====================================================
-- Migration 07: Create Stage Transitions Table
-- Purpose: Track project stage transitions with history
-- Run this AFTER migration 06
-- =====================================================

-- Create Stage Transitions Table
CREATE TABLE IF NOT EXISTS stage_transitions (
    id SERIAL PRIMARY KEY,
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    "fromStage" VARCHAR(100),
    "toStage" VARCHAR(100) NOT NULL,
    "fromStageId" INTEGER REFERENCES project_stages(id) ON DELETE SET NULL,
    "toStageId" INTEGER REFERENCES project_stages(id) ON DELETE SET NULL,
    "transitionedBy" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    notes TEXT,
    "checklistCompleted" BOOLEAN DEFAULT FALSE,
    "approvalReceived" BOOLEAN DEFAULT FALSE,
    "approvalId" INTEGER REFERENCES approvals(id) ON DELETE SET NULL,
    metadata JSONB,
    "transitionedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stage_transitions_project ON stage_transitions("projectId");
CREATE INDEX IF NOT EXISTS idx_stage_transitions_from_stage ON stage_transitions("fromStageId");
CREATE INDEX IF NOT EXISTS idx_stage_transitions_to_stage ON stage_transitions("toStageId");
CREATE INDEX IF NOT EXISTS idx_stage_transitions_user ON stage_transitions("transitionedBy");
CREATE INDEX IF NOT EXISTS idx_stage_transitions_date ON stage_transitions("transitionedAt" DESC);

-- Create function to transition project stage
CREATE OR REPLACE FUNCTION transition_project_stage(
    p_project_id INTEGER,
    p_to_stage VARCHAR(100),
    p_user_id INTEGER,
    p_reason TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_current_stage VARCHAR(100);
    v_from_stage_id INTEGER;
    v_to_stage_id INTEGER;
    v_transition_id INTEGER;
BEGIN
    -- Get current stage
    SELECT "currentStage" INTO v_current_stage
    FROM projects
    WHERE id = p_project_id;
    
    -- Get stage IDs
    SELECT id INTO v_from_stage_id
    FROM project_stages
    WHERE "projectId" = p_project_id 
    AND "stageName" = v_current_stage
    LIMIT 1;
    
    SELECT id INTO v_to_stage_id
    FROM project_stages
    WHERE "projectId" = p_project_id 
    AND "stageName" = p_to_stage
    LIMIT 1;
    
    -- Create transition record
    INSERT INTO stage_transitions (
        "projectId", "fromStage", "toStage",
        "fromStageId", "toStageId",
        "transitionedBy", reason, notes
    ) VALUES (
        p_project_id, v_current_stage, p_to_stage,
        v_from_stage_id, v_to_stage_id,
        p_user_id, p_reason, p_notes
    ) RETURNING id INTO v_transition_id;
    
    -- Update project current stage
    UPDATE projects
    SET "currentStage" = p_to_stage,
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = p_project_id;
    
    -- Update old stage status to completed
    IF v_from_stage_id IS NOT NULL THEN
        UPDATE project_stages
        SET status = 'completed',
            "actualEndDate" = CURRENT_DATE,
            "progressPercentage" = 100,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = v_from_stage_id;
    END IF;
    
    -- Update new stage status to in_progress
    IF v_to_stage_id IS NOT NULL THEN
        UPDATE project_stages
        SET status = 'in_progress',
            "actualStartDate" = CURRENT_DATE,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = v_to_stage_id;
    END IF;
    
    RETURN v_transition_id;
END;
$$ LANGUAGE plpgsql;

-- Success message
SELECT 'Migration 07 completed: Stage Transitions table created successfully!' as message;
