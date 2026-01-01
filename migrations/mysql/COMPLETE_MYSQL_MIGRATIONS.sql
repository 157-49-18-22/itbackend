-- =====================================================
-- IT AGENCY PMS - COMPLETE MYSQL DATABASE SCHEMA
-- =====================================================
-- Created: 2026-01-01
-- Description: Complete database schema for IT Agency Project Management System
-- =====================================================

-- Drop existing database if exists and create new
DROP DATABASE IF EXISTS it_agency_pms;
CREATE DATABASE it_agency_pms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE it_agency_pms;

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Project Manager', 'Developer', 'Designer', 'Tester', 'Client') DEFAULT 'Developer',
    avatar VARCHAR(255),
    phone VARCHAR(20),
    department VARCHAR(50) DEFAULT 'Development',
    designation VARCHAR(100),
    status ENUM('active', 'inactive', 'on-leave') DEFAULT 'active',
    joinDate DATETIME,
    skills JSON,
    bio TEXT,
    socialLinks JSON,
    preferences JSON,
    lastLogin DATETIME,
    refreshToken VARCHAR(500),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. CLIENTS TABLE
-- =====================================================
CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(255),
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    address JSON,
    industry VARCHAR(100),
    website VARCHAR(255),
    contactPerson JSON,
    status ENUM('Active', 'Inactive', 'Prospect') DEFAULT 'Active',
    notes TEXT,
    tags JSON,
    socialLinks JSON,
    billingInfo JSON,
    company VARCHAR(100),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. PROJECTS TABLE
-- =====================================================
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    clientId INT NOT NULL,
    status ENUM('Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled') DEFAULT 'Planning',
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    currentPhase ENUM('Planning', 'UI/UX Design', 'Development', 'Testing', 'Deployment', 'Completed') DEFAULT 'Planning',
    progress INT DEFAULT 0,
    startDate DATETIME NOT NULL,
    endDate DATETIME NOT NULL,
    actualEndDate DATETIME,
    budget JSON,
    projectManagerId INT,
    teamMembers JSON,
    phases JSON,
    tags JSON,
    attachments JSON,
    repository JSON,
    isArchived TINYINT(1) DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (projectManagerId) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_clientId (clientId),
    INDEX idx_projectManagerId (projectManagerId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. PROJECT_STAGES TABLE
-- =====================================================
CREATE TABLE project_stages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    projectId INT NOT NULL,
    stageNumber INT NOT NULL,
    stageName VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'not_started',
    startDate DATE,
    endDate DATE,
    actualStartDate DATE,
    actualEndDate DATE,
    progressPercentage INT DEFAULT 0,
    assignedTeamLead INT,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assignedTeamLead) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_projectId (projectId),
    INDEX idx_status (status),
    INDEX idx_assignedTeamLead (assignedTeamLead)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. SPRINTS TABLE
-- =====================================================
CREATE TABLE sprints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    goal TEXT,
    projectId INT NOT NULL,
    startDate DATETIME NOT NULL,
    endDate DATETIME NOT NULL,
    status ENUM('active', 'completed', 'planned') DEFAULT 'planned',
    velocity INT DEFAULT 0,
    completedPoints INT DEFAULT 0,
    totalPoints INT DEFAULT 0,
    total_points INT DEFAULT 0,
    completed_points INT DEFAULT 0,
    tasks JSON DEFAULT (_cp850'[]'),
    retrospective TEXT,
    notes TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_projectId (projectId),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. TASKS TABLE
-- =====================================================
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status ENUM('todo', 'in_progress', 'in_review', 'done') DEFAULT 'todo',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    projectId INT NOT NULL,
    assigneeId INT,
    reporterId INT,
    dueDate DATETIME,
    estimatedHours DECIMAL(10,2),
    actualHours DECIMAL(10,2),
    labels JSON,
    sprintId INT,
    storyPoints INT DEFAULT 0,
    type ENUM('task', 'bug', 'story', 'epic', 'test') NOT NULL DEFAULT 'task',
    startDate DATETIME,
    endDate DATETIME,
    phase ENUM('UI/UX', 'Development', 'Testing') DEFAULT 'Development',
    tags JSON DEFAULT (json_array()),
    attachments JSON DEFAULT (json_array()),
    comments JSON DEFAULT (json_array()),
    checklist JSON DEFAULT (json_array()),
    dependencies JSON DEFAULT (json_array()),
    stageId INT,
    completionDate TIMESTAMP,
    orderIndex INT DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assigneeId) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (reporterId) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (stageId) REFERENCES project_stages(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_projectId (projectId),
    INDEX idx_assigneeId (assigneeId),
    INDEX idx_reporterId (reporterId),
    INDEX idx_dueDate (dueDate),
    INDEX idx_stageId (stageId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. SPRINT_TASKS TABLE
-- =====================================================
CREATE TABLE sprint_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sprint_id INT NOT NULL,
    task_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    INDEX idx_sprint_id (sprint_id),
    INDEX idx_task_id (task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. TASK_CHECKLISTS TABLE
-- =====================================================
CREATE TABLE task_checklists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    taskId INT NOT NULL,
    description VARCHAR(500) NOT NULL,
    isCompleted TINYINT(1) DEFAULT 0,
    completedAt DATETIME,
    completedBy INT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (completedBy) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_taskId (taskId),
    INDEX idx_completedBy (completedBy)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 9. TASK_CHECKLISTS_NEW TABLE
-- =====================================================
CREATE TABLE task_checklists_new (
    id INT AUTO_INCREMENT PRIMARY KEY,
    taskId INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    isCompleted TINYINT(1) DEFAULT 0,
    completedBy INT,
    completedAt TIMESTAMP,
    orderIndex INT DEFAULT 0,
    dueDate TIMESTAMP,
    priority VARCHAR(20) DEFAULT 'medium',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (completedBy) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_taskId (taskId),
    INDEX idx_completedBy (completedBy)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 10. TASK_COMMENTS TABLE
-- =====================================================
CREATE TABLE task_comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_task_id (task_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 11. DELIVERABLES TABLE
-- =====================================================
CREATE TABLE deliverables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    filename VARCHAR(255),
    description TEXT,
    type VARCHAR(50),
    size INT,
    projectId INT NOT NULL,
    status ENUM('Draft', 'Pending Approval', 'Approved', 'Rejected') DEFAULT 'Draft',
    stage VARCHAR(50),
    version VARCHAR(20),
    fileUrl VARCHAR(500),
    dueDate DATETIME,
    submittedAt DATETIME,
    approvedAt DATETIME,
    rejectedAt DATETIME,
    rejectionReason TEXT,
    uploadedById INT,
    fileSize BIGINT DEFAULT 0,
    fileType VARCHAR(100) DEFAULT 'File',
    phase VARCHAR(50) DEFAULT 'Initial',
    tags TEXT,
    versions TEXT,
    approvals TEXT,
    isArchived TINYINT(1) DEFAULT 0,
    completedAt DATETIME,
    approvalStatus VARCHAR(50) DEFAULT 'pending',
    approvedBy INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (uploadedById) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_projectId (projectId),
    INDEX idx_status (status),
    INDEX idx_uploadedById (uploadedById),
    INDEX idx_phase (phase)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 12. APPROVALS TABLE
-- =====================================================
CREATE TABLE approvals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    approvalId VARCHAR(50) NOT NULL UNIQUE,
    type ENUM('Deliverable', 'Stage Transition', 'Bug Fix', 'Design', 'Code Review') NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    projectId INT NOT NULL,
    requestedById INT NOT NULL,
    requestedToId INT NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed') DEFAULT 'Pending',
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    notes TEXT,
    version VARCHAR(50) DEFAULT '-',
    attachments JSON,
    approvedAt DATETIME,
    rejectedAt DATETIME,
    rejectionReason TEXT,
    relatedDeliverableId INT,
    dueDate DATETIME,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (requestedById) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (requestedToId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (relatedDeliverableId) REFERENCES deliverables(id) ON DELETE SET NULL,
    INDEX idx_approvalId (approvalId),
    INDEX idx_projectId (projectId),
    INDEX idx_requestedById (requestedById),
    INDEX idx_requestedToId (requestedToId),
    INDEX idx_status (status),
    INDEX idx_relatedDeliverableId (relatedDeliverableId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 13. APPROVALS_NEW TABLE
-- =====================================================
CREATE TABLE approvals_new (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    projectId INT,
    stageId INT,
    deliverableId INT,
    taskId INT,
    requestedBy INT NOT NULL,
    requestedTo INT NOT NULL,
    approvalType VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    relatedId INT,
    relatedType VARCHAR(50),
    comments TEXT,
    rejectionReason TEXT,
    priority VARCHAR(20) DEFAULT 'medium',
    dueDate TIMESTAMP,
    requestedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    respondedAt TIMESTAMP,
    respondedBy INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (stageId) REFERENCES project_stages(id) ON DELETE SET NULL,
    FOREIGN KEY (deliverableId) REFERENCES deliverables(id) ON DELETE SET NULL,
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE SET NULL,
    FOREIGN KEY (requestedBy) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (requestedTo) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (respondedBy) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_projectId (projectId),
    INDEX idx_stageId (stageId),
    INDEX idx_deliverableId (deliverableId),
    INDEX idx_taskId (taskId),
    INDEX idx_requestedBy (requestedBy),
    INDEX idx_requestedTo (requestedTo),
    INDEX idx_status (status),
    INDEX idx_respondedBy (respondedBy)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 14. WIREFRAMES TABLE
-- =====================================================
CREATE TABLE wireframes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50) DEFAULT '1.0',
    status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'draft',
    category ENUM('web', 'mobile', 'desktop', 'tablet', 'Web App', 'Mobile App', 'Desktop App') DEFAULT 'web',
    project_id INT,
    user_id INT,
    created_by INT,
    approved_by INT,
    approved_at DATETIME,
    feedback TEXT,
    updated_by INT,
    image_url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_project_id (project_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 15. WIREFRAME TABLE (Singular)
-- =====================================================
CREATE TABLE wireframe (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    version VARCHAR(50) DEFAULT '1.0',
    status ENUM('draft', 'in_review', 'approved', 'rejected') DEFAULT 'draft',
    category ENUM('web', 'mobile', 'tablet', 'desktop') DEFAULT 'web',
    project_id INT NOT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_project_id (project_id),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 16. MOCKUPS TABLE
-- =====================================================
CREATE TABLE mockups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50) DEFAULT '1.0',
    status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'draft',
    category ENUM('web', 'mobile', 'desktop', 'tablet', 'Web App', 'Mobile App', 'Desktop App') DEFAULT 'web',
    project_id INT,
    user_id INT,
    created_by INT,
    approved_by INT,
    approved_at DATETIME,
    feedback TEXT,
    updated_by INT,
    image_url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_project_id (project_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 17. MOCKUP TABLE (Singular)
-- =====================================================
CREATE TABLE mockup (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    version VARCHAR(50) DEFAULT '1.0',
    status ENUM('draft', 'in_review', 'approved', 'rejected') DEFAULT 'draft',
    category ENUM('Web App', 'Mobile', 'Marketing', 'Dashboard') DEFAULT 'Web App',
    project_id INT NOT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_project_id (project_id),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 18. PROTOTYPES TABLE
-- =====================================================
CREATE TABLE prototypes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50) DEFAULT '1.0',
    status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'draft',
    category ENUM('web', 'mobile', 'desktop', 'tablet', 'Web App', 'Mobile App', 'Desktop App') DEFAULT 'web',
    link VARCHAR(500),
    project_id INT,
    user_id INT,
    created_by INT,
    approved_by INT,
    approved_at DATETIME,
    feedback TEXT,
    updated_by INT,
    image_url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_project_id (project_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 19. PROTOTYPE TABLE (Singular)
-- =====================================================
CREATE TABLE prototype (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    link VARCHAR(500),
    version VARCHAR(50) DEFAULT '1.0',
    status ENUM('draft', 'in_progress', 'in_review', 'approved') DEFAULT 'draft',
    category ENUM('web', 'mobile', 'tablet', 'desktop') DEFAULT 'web',
    project_id INT NOT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_project_id (project_id),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 20. CODEFILES TABLE
-- =====================================================
CREATE TABLE codefiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    language VARCHAR(255) NOT NULL DEFAULT 'javascript',
    path VARCHAR(255),
    projectId INT NOT NULL,
    createdBy INT NOT NULL,
    updatedBy INT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt DATETIME,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (updatedBy) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_projectId (projectId),
    INDEX idx_createdBy (createdBy),
    INDEX idx_updatedBy (updatedBy)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 21. CODEFILE TABLE (Singular)
-- =====================================================
CREATE TABLE codefile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    language VARCHAR(255) NOT NULL DEFAULT 'javascript',
    path VARCHAR(255),
    projectId INT NOT NULL,
    createdBy INT NOT NULL,
    updatedBy INT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt DATETIME,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (updatedBy) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_projectId (projectId),
    INDEX idx_createdBy (createdBy),
    INDEX idx_updatedBy (updatedBy)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 22. CODE_REPOSITORIES TABLE
-- =====================================================
CREATE TABLE code_repositories (
    repo_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    repo_name VARCHAR(255) NOT NULL,
    repo_url VARCHAR(500),
    repo_type ENUM('github', 'gitlab', 'bitbucket') DEFAULT 'github',
    branch_name VARCHAR(100) DEFAULT 'main',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 23. CODE_REVIEWS TABLE
-- =====================================================
CREATE TABLE code_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    author VARCHAR(100),
    reviewer VARCHAR(100),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    branch VARCHAR(100),
    code_url VARCHAR(255),
    files_changed INT DEFAULT 0,
    lines_added INT DEFAULT 0,
    lines_removed INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 24. DEPLOYMENTS TABLE
-- =====================================================
CREATE TABLE deployments (
    id CHAR(36) PRIMARY KEY,
    projectId INT,
    environment ENUM('development', 'staging', 'production') NOT NULL DEFAULT 'development',
    branch VARCHAR(255) NOT NULL,
    commitHash VARCHAR(255),
    commitMessage TEXT,
    status ENUM('pending', 'in_progress', 'success', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
    startedAt DATETIME NOT NULL,
    completedAt DATETIME,
    deployedBy INT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt DATETIME,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (deployedBy) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_projectId (projectId),
    INDEX idx_environment (environment),
    INDEX idx_status (status),
    INDEX idx_deployedBy (deployedBy)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 25. BUGS TABLE
-- =====================================================
CREATE TABLE bugs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status ENUM('open', 'in_progress', 'resolved', 'closed', 'reopened') DEFAULT 'open',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    steps_to_reproduce TEXT,
    expected_result TEXT,
    actual_result TEXT,
    project_id INT,
    reported_by INT NOT NULL,
    assigned_to INT,
    environment VARCHAR(100),
    browserInfo VARCHAR(255),
    deviceInfo VARCHAR(255),
    screenshotUrl VARCHAR(500),
    resolvedAt TIMESTAMP,
    resolvedBy INT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_severity (severity),
    INDEX idx_project_id (project_id),
    INDEX idx_reported_by (reported_by),
    INDEX idx_assigned_to (assigned_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 26. BUG_COMMENTS TABLE
-- =====================================================
CREATE TABLE bug_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comment TEXT NOT NULL,
    bug_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bug_id) REFERENCES bugs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_bug_id (bug_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 27. TEST_CASES TABLE
-- =====================================================
CREATE TABLE test_cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type ENUM('functional', 'integration', 'regression', 'smoke', 'sanity', 'performance') DEFAULT 'functional',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('not_run', 'passed', 'failed', 'blocked') DEFAULT 'not_run',
    steps JSON,
    expected_result TEXT,
    project_id INT,
    created_by INT NOT NULL,
    assigned_to INT,
    last_run DATETIME,
    executedBy INT,
    executionDate TIMESTAMP,
    actualResult TEXT,
    attachmentUrl VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_project_id (project_id),
    INDEX idx_created_by (created_by),
    INDEX idx_assigned_to (assigned_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 28. TEST_RESULTS TABLE
-- =====================================================
CREATE TABLE test_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status ENUM('passed', 'failed', 'blocked') NOT NULL,
    notes TEXT,
    test_case_id INT NOT NULL,
    executed_by INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (test_case_id) REFERENCES test_cases(id) ON DELETE CASCADE,
    FOREIGN KEY (executed_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_test_case_id (test_case_id),
    INDEX idx_executed_by (executed_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 29. UATS TABLE
-- =====================================================
CREATE TABLE uats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    steps JSON NOT NULL DEFAULT (json_array()),
    status ENUM('pending', 'in-progress', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    tester VARCHAR(255),
    commentsCount INT NOT NULL DEFAULT 0,
    projectId INT,
    createdBy INT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_projectId (projectId),
    INDEX idx_createdBy (createdBy)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 30. PERFORMANCE_TESTS TABLE
-- =====================================================
CREATE TABLE performance_tests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(255) NOT NULL,
    status ENUM('passed', 'warning', 'failed', 'running') DEFAULT 'running',
    url VARCHAR(255),
    duration INT,
    concurrent_users INT,
    target_response_time INT,
    avg_response_time INT DEFAULT 0,
    max_response_time INT DEFAULT 0,
    min_response_time INT DEFAULT 0,
    throughput FLOAT DEFAULT 0,
    error_rate FLOAT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 31. BLOCKERS TABLE
-- =====================================================
CREATE TABLE blockers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('open', 'in-progress', 'resolved', 'closed') DEFAULT 'open',
    taskId INT,
    projectId INT NOT NULL,
    reportedBy INT NOT NULL,
    resolvedBy INT,
    resolvedAt DATETIME,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (reportedBy) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resolvedBy) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_taskId (taskId),
    INDEX idx_projectId (projectId),
    INDEX idx_reportedBy (reportedBy),
    INDEX idx_resolvedBy (resolvedBy)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 32. FEEDBACKS TABLE
-- =====================================================
CREATE TABLE feedbacks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('code-review', 'peer-review', 'client-feedback', 'admin-feedback') NOT NULL,
    taskId INT,
    projectId INT NOT NULL,
    taskName VARCHAR(255) NOT NULL,
    feedback TEXT NOT NULL,
    suggestions JSON,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('pending', 'addressed', 'dismissed') DEFAULT 'pending',
    reviewerId INT NOT NULL,
    developerId INT NOT NULL,
    addressedAt DATETIME,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewerId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (developerId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_taskId (taskId),
    INDEX idx_projectId (projectId),
    INDEX idx_reviewerId (reviewerId),
    INDEX idx_developerId (developerId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 33. COMMENTS TABLE
-- =====================================================
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    projectId INT,
    taskId INT,
    deliverableId INT,
    bugId INT,
    userId INT NOT NULL,
    commentText TEXT NOT NULL,
    parentCommentId INT,
    isEdited TINYINT(1) DEFAULT 0,
    editedAt TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (deliverableId) REFERENCES deliverables(id) ON DELETE CASCADE,
    FOREIGN KEY (bugId) REFERENCES bugs(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parentCommentId) REFERENCES comments(id) ON DELETE CASCADE,
    INDEX idx_projectId (projectId),
    INDEX idx_taskId (taskId),
    INDEX idx_deliverableId (deliverableId),
    INDEX idx_bugId (bugId),
    INDEX idx_userId (userId),
    INDEX idx_parentCommentId (parentCommentId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 34. MESSAGES TABLE
-- =====================================================
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    senderId INT NOT NULL,
    projectId INT,
    subject VARCHAR(255),
    parentMessageId INT,
    thread VARCHAR(100) NOT NULL,
    recipients JSON,
    content TEXT NOT NULL,
    attachments JSON,
    readBy JSON,
    isStarred JSON,
    isArchived TINYINT(1) DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY (parentMessageId) REFERENCES messages(id) ON DELETE CASCADE,
    INDEX idx_senderId (senderId),
    INDEX idx_projectId (projectId),
    INDEX idx_parentMessageId (parentMessageId),
    INDEX idx_thread (thread)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 35. FILE_ATTACHMENTS TABLE
-- =====================================================
CREATE TABLE file_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fileName VARCHAR(255) NOT NULL,
    filePath VARCHAR(500) NOT NULL,
    fileSize BIGINT,
    fileType VARCHAR(100),
    mimeType VARCHAR(100),
    uploadedBy INT NOT NULL,
    projectId INT,
    taskId INT,
    commentId INT,
    messageId INT,
    description TEXT,
    isPublic TINYINT(1) DEFAULT 0,
    downloadCount INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (uploadedBy) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (commentId) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (messageId) REFERENCES messages(id) ON DELETE CASCADE,
    INDEX idx_uploadedBy (uploadedBy),
    INDEX idx_projectId (projectId),
    INDEX idx_taskId (taskId),
    INDEX idx_commentId (commentId),
    INDEX idx_messageId (messageId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 36. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    isRead TINYINT(1) DEFAULT 0,
    readAt DATETIME,
    relatedType VARCHAR(50),
    relatedId INT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_userId (userId),
    INDEX idx_relatedType (relatedType)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 37. NOTIFICATIONS_NEW TABLE
-- =====================================================
CREATE TABLE notifications_new (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    isRead TINYINT(1) DEFAULT 0,
    readAt TIMESTAMP,
    relatedId INT,
    relatedType VARCHAR(50),
    link VARCHAR(500),
    priority VARCHAR(20) DEFAULT 'normal',
    actionRequired TINYINT(1) DEFAULT 0,
    expiresAt TIMESTAMP,
    metadata JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_userId (userId),
    INDEX idx_type (type),
    INDEX idx_isRead (isRead)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 38. CALENDAR_EVENTS TABLE
-- =====================================================
CREATE TABLE calendar_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type ENUM('Meeting', 'Deadline', 'Milestone', 'Review', 'Holiday', 'Other') NOT NULL,
    startDate DATETIME NOT NULL,
    endDate DATETIME NOT NULL,
    allDay TINYINT(1) DEFAULT 0,
    location VARCHAR(255),
    meetingLink VARCHAR(500),
    projectId INT,
    organizerId INT NOT NULL,
    attendees JSON,
    reminder JSON,
    color VARCHAR(20) DEFAULT '#3b82f6',
    isRecurring TINYINT(1) DEFAULT 0,
    recurrence JSON,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (organizerId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_projectId (projectId),
    INDEX idx_organizerId (organizerId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 39. CALENDAR_EVENTS_NEW TABLE
-- =====================================================
CREATE TABLE calendar_events_new (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    startDate TIMESTAMP NOT NULL,
    endDate TIMESTAMP NOT NULL,
    allDay TINYINT(1) DEFAULT 0,
    eventType VARCHAR(50),
    projectId INT,
    taskId INT,
    createdBy INT NOT NULL,
    location VARCHAR(255),
    meetingUrl VARCHAR(500),
    attendees JSON,
    reminderMinutes INT DEFAULT 15,
    isRecurring TINYINT(1) DEFAULT 0,
    recurrenceRule VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_projectId (projectId),
    INDEX idx_taskId (taskId),
    INDEX idx_createdBy (createdBy)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 40. TIME_TRACKING TABLE
-- =====================================================
CREATE TABLE time_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    projectId INT NOT NULL,
    taskId INT,
    description TEXT,
    startTime DATETIME NOT NULL,
    endTime DATETIME,
    duration INT DEFAULT 0,
    isBillable TINYINT(1) DEFAULT 1,
    hourlyRate DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('Running', 'Stopped', 'Approved', 'Rejected') DEFAULT 'Stopped',
    tags JSON DEFAULT (json_array()),
    notes TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_userId (userId),
    INDEX idx_projectId (projectId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 41. TIME_LOGS TABLE
-- =====================================================
CREATE TABLE time_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    task_id INT,
    hours_worked DECIMAL(10,2) NOT NULL,
    work_description TEXT,
    log_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_task_id (task_id),
    INDEX idx_log_date (log_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 42. TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    project_id INT,
    type ENUM('invoice', 'expense', 'payment', 'refund') NOT NULL,
    description TEXT,
    amount DECIMAL(12,2) NOT NULL,
    status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 43. STAGE_TRANSITIONS TABLE
-- =====================================================
CREATE TABLE stage_transitions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    taskId INT NOT NULL,
    fromStage VARCHAR(50) NOT NULL,
    toStage VARCHAR(50) NOT NULL,
    userId INT NOT NULL,
    comments TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_taskId (taskId),
    INDEX idx_userId (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 44. STAGE_TRANSITIONS_NEW TABLE
-- =====================================================
CREATE TABLE stage_transitions_new (
    id INT AUTO_INCREMENT PRIMARY KEY,
    projectId INT NOT NULL,
    fromStage VARCHAR(100),
    toStage VARCHAR(100) NOT NULL,
    fromStageId INT,
    toStageId INT,
    transitionedBy INT NOT NULL,
    reason TEXT,
    notes TEXT,
    checklistCompleted TINYINT(1) DEFAULT 0,
    approvalReceived TINYINT(1) DEFAULT 0,
    approvalId INT,
    metadata JSON,
    transitionedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (fromStageId) REFERENCES project_stages(id) ON DELETE SET NULL,
    FOREIGN KEY (toStageId) REFERENCES project_stages(id) ON DELETE SET NULL,
    FOREIGN KEY (transitionedBy) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_projectId (projectId),
    INDEX idx_fromStageId (fromStageId),
    INDEX idx_toStageId (toStageId),
    INDEX idx_transitionedBy (transitionedBy)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 45. WORKFLOW_STATES TABLE
-- =====================================================
CREATE TABLE workflow_states (
    id INT AUTO_INCREMENT PRIMARY KEY,
    projectId INT NOT NULL,
    stage VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'not_started',
    startedAt TIMESTAMP,
    completedAt TIMESTAMP,
    blockedReason TEXT,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_projectId (projectId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 46. ACTIVITY_LOGS TABLE
-- =====================================================
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50),
    entity_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 47. AUDIT_TRAIL TABLE
-- =====================================================
CREATE TABLE audit_trail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    actionType VARCHAR(100) NOT NULL,
    entityType VARCHAR(100) NOT NULL,
    entityId INT,
    oldValue JSON,
    newValue JSON,
    ipAddress VARCHAR(50),
    userAgent TEXT,
    description TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_userId (userId),
    INDEX idx_actionType (actionType),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 48. DISCUSSIONS TABLE
-- =====================================================
CREATE TABLE discussions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'General',
    content TEXT,
    excerpt TEXT,
    tags JSON,
    replies_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 49. DOCUMENTS TABLE
-- =====================================================
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    description TEXT,
    content MEDIUMTEXT,
    author VARCHAR(100),
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    views INT DEFAULT 0,
    sections_count INT DEFAULT 1,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 50. VERSION_HISTORY TABLE
-- =====================================================
CREATE TABLE version_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    version VARCHAR(20) NOT NULL,
    type ENUM('major', 'minor', 'patch') DEFAULT 'patch',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    author VARCHAR(100),
    release_date DATE,
    release_time VARCHAR(20),
    branch VARCHAR(100),
    commit_hash VARCHAR(40),
    files_changed INT DEFAULT 0,
    additions INT DEFAULT 0,
    deletions INT DEFAULT 0,
    changes JSON,
    status ENUM('deployed', 'staging', 'development') DEFAULT 'development',
    deployed_to VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 51. SEQUELIZEMETA TABLE
-- =====================================================
CREATE TABLE sequelizemeta (
    name VARCHAR(255) NOT NULL PRIMARY KEY
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- END OF SCHEMA CREATION
-- =====================================================

-- Insert default admin user (password: admin123)
INSERT INTO users (name, email, password, role, department, status, createdAt, updatedAt) 
VALUES (
    'System Admin',
    'admin@itagency.com',
    '$2a$10$XqJy8z5K5Z5Z5Z5Z5Z5Z5uO5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5',
    'Admin',
    'Management',
    'active',
    NOW(),
    NOW()
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Uncomment to verify table creation:
-- SHOW TABLES;
-- SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'it_agency_pms';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'Database schema created successfully! Total tables: 51' AS Status;
