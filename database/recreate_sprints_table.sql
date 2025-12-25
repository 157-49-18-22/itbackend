-- First, check current table structure
DESCRIBE sprints;

-- Option 1: If table exists but columns are wrong, drop and recreate
DROP TABLE IF EXISTS sprints;

CREATE TABLE sprints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  goal TEXT,
  project_id INT NOT NULL,
  status ENUM('Planned', 'Active', 'Completed', 'Cancelled') DEFAULT 'Planned',
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  total_points INT DEFAULT 0,
  completed_points INT DEFAULT 0,
  velocity DECIMAL(10, 2) DEFAULT 0,
  tasks JSON DEFAULT ('[]'),
  retrospective TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_project_id (project_id),
  INDEX idx_status (status),
  INDEX idx_start_date (start_date),
  INDEX idx_end_date (end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify table structure
DESCRIBE sprints;
