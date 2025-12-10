-- =====================================================
-- Migration 05: Create/Update Approvals Table
-- Purpose: Comprehensive approval workflow system
-- Run this AFTER migration 04
-- =====================================================

-- Drop existing approvals table if it exists (to recreate with new structure)
-- Comment this out if you want to keep existing data
-- DROP TABLE IF EXISTS approvals CASCADE;

-- Create Enhanced Approvals Table
CREATE TABLE IF NOT EXISTS approvals (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "projectId" INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    "stageId" INTEGER REFERENCES project_stages(id) ON DELETE CASCADE,
    "deliverableId" INTEGER REFERENCES deliverables(id) ON DELETE SET NULL,
    "taskId" INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
    "requestedBy" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "requestedTo" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "approvalType" VARCHAR(50) NOT NULL CHECK ("approvalType" IN (
        'design', 'code', 'deployment', 'deliverable', 
        'budget', 'timeline', 'stage_completion', 'other'
    )),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'rejected', 'cancelled', 'revision_requested'
    )),
    "relatedId" INTEGER,
    "relatedType" VARCHAR(50),
    comments TEXT,
    "rejectionReason" TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    "dueDate" TIMESTAMP,
    "requestedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP,
    "respondedBy" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_approvals_project ON approvals("projectId");
CREATE INDEX IF NOT EXISTS idx_approvals_stage ON approvals("stageId");
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_type ON approvals("approvalType");
CREATE INDEX IF NOT EXISTS idx_approvals_requested_by ON approvals("requestedBy");
CREATE INDEX IF NOT EXISTS idx_approvals_requested_to ON approvals("requestedTo");
CREATE INDEX IF NOT EXISTS idx_approvals_due_date ON approvals("dueDate");

-- Create trigger to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_approvals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    IF NEW.status != OLD.status AND NEW.status != 'pending' THEN
        NEW."respondedAt" = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS approvals_updated_at ON approvals;
CREATE TRIGGER approvals_updated_at
    BEFORE UPDATE ON approvals
    FOR EACH ROW
    EXECUTE FUNCTION update_approvals_updated_at();

-- Success message
SELECT 'Migration 05 completed: Enhanced Approvals table created successfully!' as message;
