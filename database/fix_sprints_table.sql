-- Check sprints table structure
DESCRIBE sprints;

-- If projectId column doesn't exist, add it
ALTER TABLE sprints 
ADD COLUMN IF NOT EXISTS projectId INT NOT NULL,
ADD CONSTRAINT fk_sprint_project 
FOREIGN KEY (projectId) REFERENCES projects(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Or if column exists with different name (project_id), rename it
-- ALTER TABLE sprints CHANGE COLUMN project_id projectId INT NOT NULL;
