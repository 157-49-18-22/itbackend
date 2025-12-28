const { sequelize } = require('../config/database.sql');

// Ensure table exists (Lite migration in controller for demo purposes)
const ensureTableExists = async () => {
    await sequelize.query(`
        CREATE TABLE IF NOT EXISTS code_reviews (
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
        );
    `);

    // Seed if empty
    const [rows] = await sequelize.query('SELECT COUNT(*) as count FROM code_reviews');
    if (rows[0].count === 0) {
        await sequelize.query(`
            INSERT INTO code_reviews (title, description, author, reviewer, status, priority, branch, code_url, files_changed, lines_added, lines_removed, comments_count)
            VALUES 
            ('Authentication Mfa', 'Implement Multi-Factor Authentication', 'John Doe', 'Jane Smith', 'pending', 'high', 'feature/mfa', 'https://github.com/project/pull/123', 5, 200, 30, 2),
            ('Mobile Responsive Fixes', 'Fix alignment issues on small screens', 'Alice Dev', 'Bob Lead', 'approved', 'medium', 'fix/mobile-css', 'https://github.com/project/pull/124', 2, 50, 20, 0),
            ('Database Optimization', 'Add indexes to user table', 'Charlie DBA', 'Dave Architect', 'rejected', 'high', 'chore/db-index', 'https://github.com/project/pull/125', 1, 10, 0, 5)
        `);
    }
};

exports.getAllReviews = async (req, res) => {
    try {
        await ensureTableExists();
        const [reviews] = await sequelize.query('SELECT * FROM code_reviews ORDER BY created_at DESC');

        // Map snake_case DB columns to camelCase for frontend
        const reviewsMapped = reviews.map(r => ({
            id: r.id,
            title: r.title,
            description: r.description,
            author: r.author,
            reviewer: r.reviewer,
            status: r.status,
            priority: r.priority,
            branch: r.branch,
            codeUrl: r.code_url,
            filesChanged: r.files_changed,
            linesAdded: r.lines_added,
            linesRemoved: r.lines_removed,
            comments: r.comments_count,
            createdAt: r.created_at,
            updatedAt: r.updated_at
        }));

        res.status(200).json({ success: true, data: reviewsMapped });
    } catch (error) {
        console.error('Error fetching code reviews:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createReview = async (req, res) => {
    try {
        await ensureTableExists();
        const { title, description, branch, codeUrl, author = 'Current User' } = req.body;

        const [result] = await sequelize.query(`
            INSERT INTO code_reviews (title, description, branch, code_url, author, status, priority)
            VALUES (?, ?, ?, ?, ?, 'pending', 'medium')
        `, { replacements: [title, description, branch, codeUrl, author] });

        res.status(201).json({ success: true, message: 'Review created', id: result });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        await ensureTableExists();
        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'

        await sequelize.query(`
            UPDATE code_reviews SET status = ? WHERE id = ?
        `, { replacements: [status, id] });

        res.status(200).json({ success: true, message: `Review ${status}` });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
