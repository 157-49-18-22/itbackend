-- Add all missing columns to sprints table
ALTER TABLE sprints ADD COLUMN tasks JSON DEFAULT ('[]');
ALTER TABLE sprints ADD COLUMN retrospective TEXT NULL;
ALTER TABLE sprints ADD COLUMN notes TEXT NULL;

-- Verify table structure
DESCRIBE sprints;
