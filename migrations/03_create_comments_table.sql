-- =====================================================
-- Migration 03: Create Comments Table
-- Purpose: Enable commenting on projects, tasks, and deliverables
-- Run this AFTER migration 02
-- =====================================================

-- Create Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    "projectId" INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    "taskId" INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    "deliverableId" INTEGER REFERENCES deliverables(id) ON DELETE CASCADE,
    "bugId" INTEGER REFERENCES bugs(id) ON DELETE CASCADE,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "commentText" TEXT NOT NULL,
    "parentCommentId" INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    "isEdited" BOOLEAN DEFAULT FALSE,
    "editedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Ensure at least one reference is provided
    CONSTRAINT check_comment_reference CHECK (
        "projectId" IS NOT NULL OR 
        "taskId" IS NOT NULL OR 
        "deliverableId" IS NOT NULL OR 
        "bugId" IS NOT NULL
    )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_project ON comments("projectId");
CREATE INDEX IF NOT EXISTS idx_comments_task ON comments("taskId");
CREATE INDEX IF NOT EXISTS idx_comments_deliverable ON comments("deliverableId");
CREATE INDEX IF NOT EXISTS idx_comments_bug ON comments("bugId");
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments("userId");
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments("parentCommentId");
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments("createdAt" DESC);

-- Create trigger to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    IF NEW."commentText" != OLD."commentText" THEN
        NEW."isEdited" = TRUE;
        NEW."editedAt" = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS comments_updated_at ON comments;
CREATE TRIGGER comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_comments_updated_at();

-- Success message
SELECT 'Migration 03 completed: Comments table created successfully!' as message;
