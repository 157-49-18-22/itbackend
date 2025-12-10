-- =====================================================
-- Migration 10: Create Initial Project Stages (MySQL)
-- Purpose: Automatically create 3 stages for all existing projects
-- Run this AFTER migration 09
-- =====================================================

-- Create stored procedure to add default stages
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS create_default_project_stages(IN p_project_id INT)
BEGIN
    -- Stage 1: UI/UX Design
    INSERT IGNORE INTO project_stages (projectId, stageNumber, stageName, status, progressPercentage)
    VALUES (p_project_id, 1, 'UI/UX Design', 'not_started', 0);
    
    -- Stage 2: Development
    INSERT IGNORE INTO project_stages (projectId, stageNumber, stageName, status, progressPercentage)
    VALUES (p_project_id, 2, 'Development', 'not_started', 0);
    
    -- Stage 3: Testing
    INSERT IGNORE INTO project_stages (projectId, stageNumber, stageName, status, progressPercentage)
    VALUES (p_project_id, 3, 'Testing', 'not_started', 0);
END //

DELIMITER ;

-- Create stages for all existing projects
CALL create_default_project_stages_for_all();

-- Create procedure to auto-create stages for new projects
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS create_default_project_stages_for_all()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_project_id INT;
    DECLARE cur CURSOR FOR SELECT id FROM projects;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO v_project_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        CALL create_default_project_stages(v_project_id);
    END LOOP;
    
    CLOSE cur;
END //

DELIMITER ;

-- Update existing projects to set currentStage if NULL
UPDATE projects SET currentStage = 'ui_ux' WHERE currentStage IS NULL;

-- Success message
SELECT 'Migration 10 completed: Initial project stages created for all projects!' as message;
SELECT COUNT(*) as total_stages_created FROM project_stages;
