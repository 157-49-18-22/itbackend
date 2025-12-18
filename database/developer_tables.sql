-- ============================================
-- DEVELOPER PAGE - DATABASE TABLES
-- ============================================
-- Run these queries in your MySQL database
-- Database: project_management
-- ============================================

USE project_management;

-- ============================================
-- 1. BUGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bugs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  status ENUM('open', 'in progress', 'resolved', 'closed', 'reopened') DEFAULT 'open',
  reported_by INT,
  assigned_to INT,
  steps_to_reproduce TEXT,
  expected_behavior TEXT,
  actual_behavior TEXT,
  browser_info VARCHAR(255),
  device_info VARCHAR(255),
  screenshot_path VARCHAR(500),
  project_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. SPRINTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sprints (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  goal TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('planning', 'active', 'completed', 'cancelled') DEFAULT 'planning',
  velocity INT DEFAULT 20,
  total_points INT DEFAULT 0,
  completed_points INT DEFAULT 0,
  total_tasks INT DEFAULT 0,
  completed_tasks INT DEFAULT 0,
  project_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. TASKS TABLE (Enhanced)
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  task_name VARCHAR(255) NOT NULL,
  task_description TEXT,
  assigned_to INT,
  assigned_by INT,
  status ENUM('not started', 'in progress', 'review', 'completed', 'blocked') DEFAULT 'not started',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  estimated_hours DECIMAL(10,2),
  actual_hours DECIMAL(10,2),
  start_date DATE,
  due_date DATE,
  completion_date DATE,
  project_id INT,
  stage_id INT,
  sprint_id INT,
  story_points INT DEFAULT 0,
  dependencies JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. TASK CHECKLISTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS task_checklists (
  checklist_id INT PRIMARY KEY AUTO_INCREMENT,
  task_id INT NOT NULL,
  checklist_item VARCHAR(255) NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_by INT,
  completed_at TIMESTAMP NULL,
  order_number INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. TIME LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS time_logs (
  log_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  task_id INT,
  hours_worked DECIMAL(10,2) NOT NULL,
  work_description TEXT,
  log_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. DELIVERABLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS deliverables (
  deliverable_id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT,
  stage_id INT,
  task_id INT,
  deliverable_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500),
  file_type VARCHAR(50),
  file_size BIGINT,
  uploaded_by INT,
  description TEXT,
  version_number VARCHAR(50),
  status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'draft',
  feedback TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  reviewed_by INT,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. BUG COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bug_comments (
  comment_id INT PRIMARY KEY AUTO_INCREMENT,
  bug_id INT NOT NULL,
  user_id INT NOT NULL,
  comment_text TEXT NOT NULL,
  comment_type ENUM('general', 'fix_update', 'status_change') DEFAULT 'general',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bug_id) REFERENCES bugs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. TASK COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS task_comments (
  comment_id INT PRIMARY KEY AUTO_INCREMENT,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. CODE REPOSITORIES TABLE (Optional)
-- ============================================
CREATE TABLE IF NOT EXISTS code_repositories (
  repo_id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  repo_name VARCHAR(255) NOT NULL,
  repo_url VARCHAR(500),
  repo_type ENUM('github', 'gitlab', 'bitbucket') DEFAULT 'github',
  branch_name VARCHAR(100) DEFAULT 'main',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. SPRINT TASKS JUNCTION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sprint_tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sprint_id INT NOT NULL,
  task_id INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_sprint_task (sprint_id, task_id),
  FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Bugs indexes
CREATE INDEX idx_bugs_status ON bugs(status);
CREATE INDEX idx_bugs_severity ON bugs(severity);
CREATE INDEX idx_bugs_assigned_to ON bugs(assigned_to);
CREATE INDEX idx_bugs_project_id ON bugs(project_id);

-- Sprints indexes
CREATE INDEX idx_sprints_status ON sprints(status);
CREATE INDEX idx_sprints_project_id ON sprints(project_id);
CREATE INDEX idx_sprints_dates ON sprints(start_date, end_date);

-- Tasks indexes
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_sprint_id ON tasks(sprint_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Time logs indexes
CREATE INDEX idx_time_logs_user_id ON time_logs(user_id);
CREATE INDEX idx_time_logs_task_id ON time_logs(task_id);
CREATE INDEX idx_time_logs_date ON time_logs(log_date);

-- Deliverables indexes
CREATE INDEX idx_deliverables_status ON deliverables(status);
CREATE INDEX idx_deliverables_project_id ON deliverables(project_id);
CREATE INDEX idx_deliverables_uploaded_by ON deliverables(uploaded_by);

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Sample Sprints
INSERT INTO sprints (name, goal, start_date, end_date, status, project_id, velocity) VALUES
('Sprint 1 - Setup & Frontend', 'Complete environment setup and basic frontend components', '2025-01-01', '2025-01-14', 'active', 1, 25),
('Sprint 2 - Backend & Integration', 'Develop backend APIs and integrate with frontend', '2025-01-15', '2025-01-28', 'planning', 1, 30);

-- Sample Bugs
INSERT INTO bugs (title, description, severity, status, reported_by, assigned_to, project_id) VALUES
('Login button not responding', 'The login button does not respond to clicks on mobile devices', 'high', 'open', 1, 2, 1),
('Dashboard loading slow', 'Dashboard takes more than 5 seconds to load', 'medium', 'in progress', 1, 2, 1),
('API timeout error', 'API calls timing out after 30 seconds', 'critical', 'open', 1, 2, 1);

-- Sample Tasks
INSERT INTO tasks (task_name, task_description, assigned_to, status, priority, project_id, sprint_id, story_points) VALUES
('Setup development environment', 'Install Node.js, MySQL, and configure project', 2, 'completed', 'high', 1, 1, 3),
('Create login component', 'Build React login component with validation', 2, 'in progress', 'high', 1, 1, 5),
('Implement authentication API', 'Create JWT-based authentication endpoints', 2, 'not started', 'high', 1, 1, 8);

-- Sample Task Checklists
INSERT INTO task_checklists (task_id, checklist_item, is_completed, order_number) VALUES
(1, 'Install Node.js', TRUE, 1),
(1, 'Install MySQL', TRUE, 2),
(1, 'Clone repository', TRUE, 3),
(1, 'Install dependencies', TRUE, 4),
(2, 'Create component structure', TRUE, 1),
(2, 'Add form validation', FALSE, 2),
(2, 'Add error handling', FALSE, 3);

-- Sample Time Logs
INSERT INTO time_logs (user_id, task_id, hours_worked, work_description, log_date) VALUES
(2, 1, 4.5, 'Setting up development environment and installing dependencies', '2025-01-01'),
(2, 2, 3.0, 'Working on login component UI', '2025-01-02'),
(2, 2, 2.5, 'Implementing form validation', '2025-01-03');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if all tables were created
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'project_management' 
AND TABLE_NAME IN (
  'bugs', 'sprints', 'tasks', 'task_checklists', 
  'time_logs', 'deliverables', 'bug_comments', 
  'task_comments', 'code_repositories', 'sprint_tasks'
)
ORDER BY TABLE_NAME;

-- Count records in each table
SELECT 
  'bugs' as table_name, COUNT(*) as record_count FROM bugs
UNION ALL
SELECT 'sprints', COUNT(*) FROM sprints
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'task_checklists', COUNT(*) FROM task_checklists
UNION ALL
SELECT 'time_logs', COUNT(*) FROM time_logs
UNION ALL
SELECT 'deliverables', COUNT(*) FROM deliverables;

-- ============================================
-- DONE! 
-- All tables created successfully
-- ============================================
