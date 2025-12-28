const { sequelize } = require('../config/database.sql');

// Ensure table exists
const ensureTableExists = async () => {
    await sequelize.query(`
        CREATE TABLE IF NOT EXISTS documents (
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
        );
    `);

    // Seed if empty
    const [rows] = await sequelize.query('SELECT COUNT(*) as count FROM documents');
    if (rows[0].count === 0) {
        await sequelize.query(`
            INSERT INTO documents (title, category, description, content, author, status, views, sections_count, last_updated)
            VALUES 
            ('API Documentation', 'Backend', 'Complete API reference with endpoints, request/response formats, and authentication', '# API Documentation\n\n## Endpoints\n... ', 'John Doe', 'published', 245, 12, '2024-12-20 10:00:00'),
            ('Component Library', 'Frontend', 'Reusable React components with props, examples, and best practices', '# Components\n\n## Button\n... ', 'Sarah Williams', 'published', 189, 8, '2024-12-22 14:30:00'),
            ('Database Schema', 'Database', 'Database structure, relationships, and migration guides', '# Schema\n\n## Users Table\n... ', 'Mike Johnson', 'draft', 67, 5, '2024-12-18 09:15:00'),
            ('Deployment Guide', 'DevOps', 'Step-by-step deployment process for staging and production environments', '# Deployment\n\n## Staging\n... ', 'Alex Chen', 'published', 312, 10, '2024-12-15 16:45:00')
        `);
    }
};

exports.getAllDocuments = async (req, res) => {
    try {
        await ensureTableExists();
        const [docs] = await sequelize.query('SELECT * FROM documents ORDER BY last_updated DESC');

        // Map snake_case to camelCase
        const docsMapped = docs.map(d => ({
            id: d.id,
            title: d.title,
            category: d.category,
            description: d.description,
            content: d.content,
            author: d.author,
            status: d.status,
            views: d.views,
            sections: d.sections_count,
            lastUpdated: d.last_updated ? new Date(d.last_updated).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        }));

        res.status(200).json({ success: true, data: docsMapped });
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createDocument = async (req, res) => {
    try {
        await ensureTableExists();
        const { title, category, description, content, author = 'Current User' } = req.body;

        const [result] = await sequelize.query(`
            INSERT INTO documents (title, category, description, content, author, status, views, sections_count)
            VALUES (?, ?, ?, ?, ?, 'draft', 0, 1)
        `, { replacements: [title, category, description, content, author] });

        res.status(201).json({ success: true, message: 'Document created', id: result });
    } catch (error) {
        console.error('Error creating document:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
