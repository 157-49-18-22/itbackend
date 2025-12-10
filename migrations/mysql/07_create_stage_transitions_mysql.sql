-- =====================================================
-- Migration 07: Create Stage Transitions Table (MySQL)
-- Purpose: Track project stage transitions with history
-- Run this AFTER migration 06
-- =====================================================

-- Create Stage Transitions Table
CREATE TABLE IF NOT EXISTS stage_transitions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    projectId INT NOT NULL,
    fromStage VARCHAR(100),
    toStage VARCHAR(100) NOT NULL,
    fromStageId INT,
    toStageId INT,
    transitionedBy INT NOT NULL,
    reason TEXT,
    notes TEXT,
    checklistCompleted BOOLEAN DEFAULT FALSE,
    approvalReceived BOOLEAN DEFAULT FALSE,
    approvalId INT,
    metadata JSON,
    transitionedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (fromStageId) REFERENCES project_stages(id) ON DELETE SET NULL,
    FOREIGN KEY (toStageId) REFERENCES project_stages(id) ON DELETE SET NULL,
    FOREIGN KEY (transitionedBy) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approvalId) REFERENCES approvals(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create indexes for better performance
CREATE INDEX idx_stage_transitions_project ON stage_transitions(projectId);
CREATE INDEX idx_stage_transitions_from_stage ON stage_transitions(fromStageId);
CREATE INDEX idx_stage_transitions_to_stage ON stage_transitions(toStageId);
CREATE INDEX idx_stage_transitions_user ON stage_transitions(transitionedBy);
CREATE INDEX idx_stage_transitions_date ON stage_transitions(transitionedAt DESC);

-- Success message
SELECT 'Migration 07 completed: Stage Transitions table created successfully!' as message;
