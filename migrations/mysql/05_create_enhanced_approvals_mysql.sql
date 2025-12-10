-- =====================================================
-- Migration 05: Create Enhanced Approvals Table (MySQL)
-- Purpose: Comprehensive approval workflow system
-- Run this AFTER migration 04
-- =====================================================

-- Create Enhanced Approvals Table
CREATE TABLE IF NOT EXISTS approvals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    projectId INT,
    stageId INT,
    deliverableId INT,
    taskId INT,
    requestedBy INT NOT NULL,
    requestedTo INT NOT NULL,
    approvalType VARCHAR(50) NOT NULL CHECK (approvalType IN (
        'design', 'code', 'deployment', 'deliverable', 
        'budget', 'timeline', 'stage_completion', 'other'
    )),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'rejected', 'cancelled', 'revision_requested'
    )),
    relatedId INT,
    relatedType VARCHAR(50),
    comments TEXT,
    rejectionReason TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    dueDate TIMESTAMP NULL,
    requestedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    respondedAt TIMESTAMP NULL,
    respondedBy INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (stageId) REFERENCES project_stages(id) ON DELETE CASCADE,
    FOREIGN KEY (deliverableId) REFERENCES deliverables(id) ON DELETE SET NULL,
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE SET NULL,
    FOREIGN KEY (requestedBy) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (requestedTo) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (respondedBy) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create indexes for better performance
CREATE INDEX idx_approvals_project ON approvals(projectId);
CREATE INDEX idx_approvals_stage ON approvals(stageId);
CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_approvals_type ON approvals(approvalType);
CREATE INDEX idx_approvals_requested_by ON approvals(requestedBy);
CREATE INDEX idx_approvals_requested_to ON approvals(requestedTo);
CREATE INDEX idx_approvals_due_date ON approvals(dueDate);

-- Success message
SELECT 'Migration 05 completed: Enhanced Approvals table created successfully!' as message;
