-- =====================================================
-- Migration 02: Create Project Stages Table (MySQL - Simple)
-- Run this AFTER migration 01
-- =====================================================

CREATE TABLE IF NOT EXISTS project_stages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    projectId INT NOT NULL,
    stageNumber INT NOT NULL,
    stageName VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'not_started',
    startDate DATE,
    endDate DATE,
    actualStartDate DATE,
    actualEndDate DATE,
    progressPercentage INT DEFAULT 0,
    assignedTeamLead INT,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_project_stage (projectId, stageNumber),
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assignedTeamLead) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_project_stages_project ON project_stages(projectId);
CREATE INDEX idx_project_stages_status ON project_stages(status);

SELECT '✅ Migration 02 completed: Project Stages table created!' as message;
