-- Create Blockers Table
CREATE TABLE IF NOT EXISTS `Blockers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `priority` ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  `status` ENUM('open', 'in-progress', 'resolved', 'closed') DEFAULT 'open',
  `taskId` INT NULL,
  `projectId` INT NOT NULL,
  `reportedBy` INT NOT NULL,
  `resolvedBy` INT NULL,
  `resolvedAt` DATETIME NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_project` (`projectId`),
  INDEX `idx_reporter` (`reportedBy`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`taskId`) REFERENCES `Tasks` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`projectId`) REFERENCES `Projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`reportedBy`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`resolvedBy`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Feedbacks Table
CREATE TABLE IF NOT EXISTS `Feedbacks` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `type` ENUM('code-review', 'peer-review', 'client-feedback', 'admin-feedback') NOT NULL,
  `taskId` INT NULL,
  `projectId` INT NOT NULL,
  `taskName` VARCHAR(255) NOT NULL,
  `feedback` TEXT NOT NULL,
  `suggestions` JSON NULL,
  `priority` ENUM('low', 'medium', 'high') DEFAULT 'medium',
  `status` ENUM('pending', 'addressed', 'dismissed') DEFAULT 'pending',
  `reviewerId` INT NOT NULL,
  `developerId` INT NOT NULL,
  `addressedAt` DATETIME NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_project` (`projectId`),
  INDEX `idx_developer` (`developerId`),
  INDEX `idx_reviewer` (`reviewerId`),
  INDEX `idx_status` (`status`),
  INDEX `idx_type` (`type`),
  FOREIGN KEY (`taskId`) REFERENCES `Tasks` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`projectId`) REFERENCES `Projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`reviewerId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`developerId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for Blockers (Optional - for testing)
INSERT INTO `Blockers` (`title`, `description`, `priority`, `status`, `projectId`, `reportedBy`, `taskId`) VALUES
('API Authentication Issue', 'Unable to authenticate with third-party API. Getting 401 errors consistently.', 'high', 'open', 1, 1, NULL),
('Database Connection Timeout', 'Database queries timing out after 30 seconds. Need to optimize or increase timeout.', 'critical', 'open', 1, 1, NULL);

-- Insert sample data for Feedbacks (Optional - for testing)
INSERT INTO `Feedbacks` (`type`, `taskName`, `feedback`, `suggestions`, `priority`, `status`, `projectId`, `reviewerId`, `developerId`) VALUES
('code-review', 'Authentication Module', 'Please add error handling for invalid credentials and implement rate limiting to prevent brute force attacks.', '["Add try-catch blocks in login function", "Implement JWT token expiration", "Add input validation for email format"]', 'high', 'pending', 1, 1, 2),
('peer-review', 'Payment Integration', 'Code looks good overall. Consider extracting the payment logic into a separate service for better maintainability.', '["Create PaymentService class", "Add unit tests for payment methods", "Document API endpoints"]', 'medium', 'addressed', 1, 1, 2),
('client-feedback', 'Dashboard UI', 'The dashboard looks great but we need to add export functionality for reports and improve mobile responsiveness.', '["Add CSV/PDF export buttons", "Fix responsive layout for tablets", "Increase font size for better readability"]', 'high', 'pending', 1, 1, 2);

-- Verify tables created
SHOW TABLES LIKE '%Blocker%';
SHOW TABLES LIKE '%Feedback%';

-- Check table structure
DESCRIBE Blockers;
DESCRIBE Feedbacks;
