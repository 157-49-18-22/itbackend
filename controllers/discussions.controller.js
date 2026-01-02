const { Discussion } = require('../models/sql');

exports.getAllDiscussions = async (req, res) => {
    try {
        const discussions = await Discussion.findAll({
            order: [['last_activity', 'DESC']]
        });

        // Map snake_case DB columns to camelCase for frontend
        const discussionsMapped = discussions.map(d => ({
            id: d.id,
            title: d.title,
            author: d.author,
            category: d.category,
            content: d.content,
            excerpt: d.excerpt,
            tags: d.tags,
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
        const { title, category, content, tags, author = 'Current User' } = req.body;

        const excerpt = content.substring(0, 100) + (content.length > 100 ? '...' : '');

        const discussion = await Discussion.create({
            title,
            category,
            content,
            excerpt,
            tags: tags || [],
            author,
            replies_count: 0,
            views_count: 0,
            last_activity: new Date()
        });

        res.status(201).json({ success: true, message: 'Discussion created', data: discussion });
    } catch (error) {
        console.error('Error creating discussion:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
