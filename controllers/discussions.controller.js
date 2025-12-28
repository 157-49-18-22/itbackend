const { sequelize } = require('../config/database.sql');

// Ensure table exists
const ensureTableExists = async () => {
    await sequelize.query(`
        CREATE TABLE IF NOT EXISTS discussions (
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
        );
    `);

    // Seed if empty
    const [rows] = await sequelize.query('SELECT COUNT(*) as count FROM discussions');
    if (rows[0].count === 0) {
        await sequelize.query(`
            INSERT INTO discussions (title, author, category, content, excerpt, tags, replies_count, views_count, last_activity)
            VALUES 
            ('Best practices for React state management', 'John Doe', 'React', 'What are your thoughts on using Context API vs Redux for medium-sized applications?', 'What are your thoughts on using Context API vs Redux for medium-sized applications?', '["React", "State Management", "Redux"]', 12, 145, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
            ('Database indexing strategies', 'Sarah Williams', 'Database', 'Looking for advice on optimizing database queries with proper indexing...', 'Looking for advice on optimizing database queries with proper indexing...', '["Database", "Performance", "PostgreSQL"]', 8, 89, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
            ('API versioning approaches', 'Mike Johnson', 'Backend', 'How do you handle API versioning in production applications?', 'How do you handle API versioning in production applications?', '["API", "Versioning", "Best Practices"]', 15, 203, DATE_SUB(NOW(), INTERVAL 1 DAY))
        `);
    }
};

exports.getAllDiscussions = async (req, res) => {
    try {
        await ensureTableExists();
        const [discussions] = await sequelize.query('SELECT * FROM discussions ORDER BY last_activity DESC');

        // Map snake_case DB columns to camelCase for frontend
        const discussionsMapped = discussions.map(d => ({
            id: d.id,
            title: d.title,
            author: d.author,
            category: d.category,
            content: d.content,
            excerpt: d.excerpt,
            tags: typeof d.tags === 'string' ? JSON.parse(d.tags) : d.tags,
            replies: d.replies_count,
            views: d.views_count,
            lastActivity: d.last_activity
        }));

        res.status(200).json({ success: true, data: discussionsMapped });
    } catch (error) {
        console.error('Error fetching discussions:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createDiscussion = async (req, res) => {
    try {
        await ensureTableExists();
        const { title, category, content, tags, author = 'Current User' } = req.body;

        // Prepare tags as JSON string
        const tagsJson = JSON.stringify(tags || []);
        const excerpt = content.substring(0, 100) + (content.length > 100 ? '...' : '');

        const [result] = await sequelize.query(`
            INSERT INTO discussions (title, category, content, excerpt, tags, author, replies_count, views_count)
            VALUES (?, ?, ?, ?, ?, ?, 0, 0)
        `, { replacements: [title, category, content, excerpt, tagsJson, author] });

        res.status(201).json({ success: true, message: 'Discussion created', id: result });
    } catch (error) {
        console.error('Error creating discussion:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
