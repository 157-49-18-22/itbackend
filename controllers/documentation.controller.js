const { Documentation } = require('../models/sql');

exports.getAllDocuments = async (req, res) => {
    try {
        const docs = await Documentation.findAll({
            order: [['updated_at', 'DESC']]
        });

        // Map Sequelize instances to plain objects for frontend
        const docsMapped = docs.map(d => {
            const data = d.toJSON();
            return {
                id: data.id,
                title: data.title,
                category: data.category,
                description: data.description,
                content: data.content,
                author: data.author,
                status: data.status,
                views: data.views,
                sections: data.sections_count,
                lastUpdated: (data.updated_at || data.updatedAt) ? new Date(data.updated_at || data.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            };
        });

        res.status(200).json({ success: true, data: docsMapped });
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createDocument = async (req, res) => {
    try {
        const { title, category, description, content } = req.body;
        const authorName = req.user ? req.user.name : (req.body.author || 'Current User');

        const doc = await Documentation.create({
            title,
            category,
            description,
            content,
            author: authorName,
            status: 'draft',
            views: 0,
            sections_count: 1
        });

        res.status(201).json({ success: true, message: 'Document created', data: doc });
    } catch (error) {
        console.error('Error creating document:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
