const { Discussion } = require('../models/sql');

exports.getAllDiscussions = async (req, res) => {
    try {
        const discussions = await Discussion.findAll({
            order: [['last_activity', 'DESC']]
        });

        // Map Sequelize instances to plain objects for frontend
        const discussionsMapped = discussions.map(d => {
            const data = d.toJSON();
            return {
                id: data.id,
                title: data.title,
                author: data.author,
                category: data.category,
                content: data.content,
                excerpt: data.excerpt,
                tags: data.tags,
                replies: data.replies_count,
                views: data.views_count,
                lastActivity: data.last_activity
            };
        });

        res.status(200).json({ success: true, data: discussionsMapped });
    } catch (error) {
        console.error('Error fetching discussions:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createDiscussion = async (req, res) => {
    try {
        const { title, category, content, tags } = req.body;
        const authorName = req.user ? req.user.name : (req.body.author || 'Current User');

        const excerpt = content.substring(0, 100) + (content.length > 100 ? '...' : '');

        const discussion = await Discussion.create({
            title,
            category,
            content,
            excerpt,
            tags: tags || [],
            author: authorName,
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
