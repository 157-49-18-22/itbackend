const { CodeReview } = require('../models/sql');

exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await CodeReview.findAll({
            order: [['created_at', 'DESC']]
        });

        // Map snake_case DB columns to camelCase for frontend (if needed, though Sequelize can do this via getters if configured)
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
        console.log('Creating code review with data:', req.body);
        const { title, description, branch, codeUrl, author = 'Current User' } = req.body;

        const review = await CodeReview.create({
            title,
            description,
            branch,
            code_url: codeUrl,
            author,
            status: 'pending',
            priority: 'medium'
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
