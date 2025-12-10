-- =====================================================
-- Migration 02: Create Project Stages Table (MySQL)
-- Purpose: Track three-stage workflow (UI/UX, Development, Testing)
-- Run this AFTER migration 01
-- =====================================================

-- Create Project Stages Table
CREATE TABLE IF NOT EXISTS project_stages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    projectId INT NOT NULL,
    stageNumber INT NOT NULL CHECK (stageNumber IN (1, 2, 3)),
    stageName VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'blocked')),
    startDate DATE,
    endDate DATE,
    actualStartDate DATE,
    actualEndDate DATE,
    progressPercentage INT DEFAULT 0 CHECK (progressPercentage >= 0 AND progressPercentage <= 100),
    assignedTeamLead INT,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_project_stage (projectId, stageNumber),
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assignedTeamLead) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create indexes for better performance
CREATE INDEX idx_project_stages_project ON project_stages(projectId);
CREATE INDEX idx_project_stages_status ON project_stages(status);

-- Add foreign key constraint to tasks table for stageId
ALTER TABLE tasks 
ADD CONSTRAINT fk_tasks_stageid 
FOREIGN KEY (stageId) REFERENCES project_stages(id) ON DELETE SET NULL;

-- Success message
SELECT 'Migration 02 completed: Project Stages table created successfully!' as message;
