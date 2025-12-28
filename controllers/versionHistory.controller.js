const { sequelize } = require('../config/database.sql');

// Ensure table exists
const ensureTableExists = async () => {
    await sequelize.query(`
        CREATE TABLE IF NOT EXISTS version_history (
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
        );
    `);

    // Seed if empty
    const [rows] = await sequelize.query('SELECT COUNT(*) as count FROM version_history');
    if (rows[0].count === 0) {
        await sequelize.query(`
            INSERT INTO version_history (version, type, title, description, author, release_date, release_time, branch, commit_hash, files_changed, additions, deletions, changes, status, deployed_to)
            VALUES 
            ('2.1.0', 'minor', 'Enhanced User Dashboard', 'Added new analytics widgets and improved performance', 'John Doe', '2024-12-23', '14:30', 'release/2.1.0', 'a3f2b1c', 24, 1250, 340, '["Added real-time analytics dashboard", "Implemented caching", "Fixed memory leak", "Updated dependencies"]', 'deployed', 'production'),
            ('2.0.0', 'major', 'Major Platform Upgrade', 'Complete redesign with new architecture', 'Sarah Williams', '2024-12-15', '10:00', 'release/2.0.0', 'b7e4d2a', 156, 8500, 3200, '["Migrated to React 18", "New design system", "Dark mode", "Refactored auth"]', 'deployed', 'production'),
            ('1.9.2', 'patch', 'Bug Fixes', 'Critical security patches', 'Mike Johnson', '2024-12-10', '16:45', 'hotfix/1.9.2', 'c9a1f3e', 8, 120, 85, '["Fixed XSS vuln", "DB timeout fix", "Pagination bug fix"]', 'deployed', 'production')
        `);
    }
};

exports.getAllVersions = async (req, res) => {
    try {
        await ensureTableExists();
        const [versions] = await sequelize.query('SELECT * FROM version_history ORDER BY release_date DESC, release_time DESC');

        // Map snake_case to camelCase
        const versionsMapped = versions.map(v => ({
            id: v.id,
            version: v.version,
            type: v.type,
            title: v.title,
            description: v.description,
            author: v.author,
            date: v.release_date,
            time: v.release_time,
            branch: v.branch,
            commitHash: v.commit_hash,
            filesChanged: v.files_changed,
            additions: v.additions,
            deletions: v.deletions,
            changes: typeof v.changes === 'string' ? JSON.parse(v.changes) : v.changes,
            status: v.status,
            deployedTo: v.deployed_to
        }));

        res.status(200).json({ success: true, data: versionsMapped });
    } catch (error) {
        console.error('Error fetching versions:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
