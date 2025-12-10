-- =====================================================
-- Migration 11: Create Useful Views and Helper Functions
-- Purpose: Create database views and functions for common queries
-- Run this AFTER migration 10
-- =====================================================

-- 1. View: Project Dashboard Summary
CREATE OR REPLACE VIEW project_dashboard_summary AS
SELECT 
    p.id as project_id,
    p.name as project_name,
    p."currentStage",
    p.status,
    p.priority,
    p."startDate",
    p."endDate",
    p.budget,
    u.name as client_name,
    pm.name as project_manager_name,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
    COUNT(DISTINCT tm.id) as team_size,
    ps1.status as uiux_status,
    ps1."progressPercentage" as uiux_progress,
    ps2.status as dev_status,
    ps2."progressPercentage" as dev_progress,
    ps3.status as testing_status,
    ps3."progressPercentage" as testing_progress
FROM projects p
LEFT JOIN users u ON p."clientId" = u.id
LEFT JOIN users pm ON p."projectManagerId" = pm.id
LEFT JOIN tasks t ON p.id = t."projectId"
LEFT JOIN LATERAL (
    SELECT DISTINCT unnest(ARRAY(
        SELECT jsonb_array_elements_text(
            CASE 
                WHEN jsonb_typeof(p.metadata->'teamMembers') = 'array' 
                THEN p.metadata->'teamMembers'
                ELSE '[]'::jsonb
            END
        )::text::int
    )) as id
) tm ON true
LEFT JOIN project_stages ps1 ON p.id = ps1."projectId" AND ps1."stageNumber" = 1
LEFT JOIN project_stages ps2 ON p.id = ps2."projectId" AND ps2."stageNumber" = 2
LEFT JOIN project_stages ps3 ON p.id = ps3."projectId" AND ps3."stageNumber" = 3
GROUP BY p.id, u.name, pm.name, ps1.status, ps1."progressPercentage", 
         ps2.status, ps2."progressPercentage", ps3.status, ps3."progressPercentage";

-- 2. View: User Workload Summary
CREATE OR REPLACE VIEW user_workload_summary AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.role,
    u.department,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'in_progress' THEN t.id END) as active_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'blocked' THEN t.id END) as blocked_tasks,
    COUNT(DISTINCT t."projectId") as projects_involved,
    COALESCE(SUM(t."estimatedHours"), 0) as total_estimated_hours,
    COALESCE(SUM(t."actualHours"), 0) as total_actual_hours
FROM users u
LEFT JOIN tasks t ON u.id = t."assignedTo"
WHERE u.role IN ('developer', 'designer', 'tester')
GROUP BY u.id;

-- 3. View: Pending Approvals Summary
CREATE OR REPLACE VIEW pending_approvals_summary AS
SELECT 
    a.id as approval_id,
    a.title,
    a."approvalType",
    a.priority,
    a."dueDate",
    a."requestedAt",
    p.name as project_name,
    requester.name as requested_by_name,
    approver.name as requested_to_name,
    a.status,
    CASE 
        WHEN a."dueDate" < CURRENT_TIMESTAMP THEN 'overdue'
        WHEN a."dueDate" < CURRENT_TIMESTAMP + INTERVAL '24 hours' THEN 'due_soon'
        ELSE 'on_time'
    END as urgency_status
FROM approvals a
LEFT JOIN projects p ON a."projectId" = p.id
LEFT JOIN users requester ON a."requestedBy" = requester.id
LEFT JOIN users approver ON a."requestedTo" = approver.id
WHERE a.status = 'pending';

-- 4. View: Bug Statistics
CREATE OR REPLACE VIEW bug_statistics AS
SELECT 
    p.id as project_id,
    p.name as project_name,
    COUNT(b.id) as total_bugs,
    COUNT(CASE WHEN b.severity = 'critical' THEN 1 END) as critical_bugs,
    COUNT(CASE WHEN b.severity = 'high' THEN 1 END) as high_bugs,
    COUNT(CASE WHEN b.severity = 'medium' THEN 1 END) as medium_bugs,
    COUNT(CASE WHEN b.severity = 'low' THEN 1 END) as low_bugs,
    COUNT(CASE WHEN b.status = 'open' THEN 1 END) as open_bugs,
    COUNT(CASE WHEN b.status = 'in_progress' THEN 1 END) as in_progress_bugs,
    COUNT(CASE WHEN b.status = 'resolved' THEN 1 END) as resolved_bugs,
    COUNT(CASE WHEN b.status = 'closed' THEN 1 END) as closed_bugs
FROM projects p
LEFT JOIN bugs b ON p.id = b."projectId"
GROUP BY p.id;

-- 5. Function: Get Project Progress Percentage
CREATE OR REPLACE FUNCTION get_project_progress(p_project_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    v_total_tasks INTEGER;
    v_completed_tasks INTEGER;
    v_progress INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total_tasks
    FROM tasks
    WHERE "projectId" = p_project_id;
    
    IF v_total_tasks = 0 THEN
        RETURN 0;
    END IF;
    
    SELECT COUNT(*) INTO v_completed_tasks
    FROM tasks
    WHERE "projectId" = p_project_id AND status = 'completed';
    
    v_progress := ROUND((v_completed_tasks::DECIMAL / v_total_tasks::DECIMAL) * 100);
    
    RETURN v_progress;
END;
$$ LANGUAGE plpgsql;

-- 6. Function: Get Overdue Tasks Count
CREATE OR REPLACE FUNCTION get_overdue_tasks_count(p_user_id INTEGER DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    IF p_user_id IS NULL THEN
        SELECT COUNT(*) INTO v_count
        FROM tasks
        WHERE "dueDate" < CURRENT_DATE 
        AND status NOT IN ('completed', 'cancelled');
    ELSE
        SELECT COUNT(*) INTO v_count
        FROM tasks
        WHERE "assignedTo" = p_user_id
        AND "dueDate" < CURRENT_DATE 
        AND status NOT IN ('completed', 'cancelled');
    END IF;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- 7. Function: Get Team Member Availability
CREATE OR REPLACE FUNCTION get_team_availability()
RETURNS TABLE (
    user_id INTEGER,
    user_name VARCHAR(255),
    role VARCHAR(50),
    active_tasks_count BIGINT,
    workload_percentage INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.name,
        u.role,
        COUNT(t.id) as active_tasks_count,
        CASE 
            WHEN COUNT(t.id) = 0 THEN 0
            WHEN COUNT(t.id) <= 3 THEN 30
            WHEN COUNT(t.id) <= 5 THEN 60
            WHEN COUNT(t.id) <= 7 THEN 85
            ELSE 100
        END as workload_percentage
    FROM users u
    LEFT JOIN tasks t ON u.id = t."assignedTo" AND t.status IN ('todo', 'in_progress')
    WHERE u.role IN ('developer', 'designer', 'tester')
    AND u.status = 'active'
    GROUP BY u.id, u.name, u.role
    ORDER BY active_tasks_count ASC;
END;
$$ LANGUAGE plpgsql;

-- Success message
SELECT 'Migration 11 completed: Views and helper functions created successfully!' as message;
