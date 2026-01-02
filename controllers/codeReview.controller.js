const { CodeReview } = require('../models/sql');

exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await CodeReview.findAll({
            order: [['created_at', 'DESC']]
        });

        // Map Sequelize instances to plain objects for frontend
        const reviewsMapped = reviews.map(r => {
            const data = r.toJSON();
            return {
                id: data.id,
                title: data.title,
                description: data.description,
                author: data.author,
                reviewer: data.reviewer,
                status: data.status,
                priority: data.priority,
                branch: data.branch,
                codeUrl: data.code_url,
                filesChanged: data.files_changed,
                linesAdded: data.lines_added,
                linesRemoved: data.lines_removed,
                comments: data.comments_count,
                createdAt: data.created_at || data.createdAt,
                updatedAt: data.updated_at || data.updatedAt
            };
        });

        res.status(200).json({ success: true, data: reviewsMapped });
    } catch (error) {
        console.error('Error fetching code reviews:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createReview = async (req, res) => {
    try {
        console.log('Creating code review with data:', req.body);
        const { title, description, branch, codeUrl, status = 'pending', priority = 'medium' } = req.body;
        const authorName = req.user ? req.user.name : (req.body.author || 'Current User');

        const review = await CodeReview.create({
            title,
            description,
            branch,
            code_url: codeUrl,
            author: authorName,
            status: status.toLowerCase(),
            priority: priority.toLowerCase()
        });

        res.status(201).json({ success: true, message: 'Review created', data: review });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'

        const review = await CodeReview.findByPk(id);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        await review.update({ status });

        res.status(200).json({ success: true, message: `Review ${status}` });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
