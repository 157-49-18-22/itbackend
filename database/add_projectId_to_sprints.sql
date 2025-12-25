-- Add missing projectId column to sprints table
ALTER TABLE sprints 
ADD COLUMN projectId INT NOT NULL AFTER goal;

-- Add foreign key constraint
ALTER TABLE sprints 
ADD CONSTRAINT fk_sprint_project 
FOREIGN KEY (projectId) REFERENCES projects(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Add index for better performance
CREATE INDEX idx_projectId ON sprints(projectId);

-- Verify the changes
DESCRIBE sprints;
