const { Documentation } = require('../models/sql');

exports.getAllDocuments = async (req, res) => {
    try {
        const docs = await Documentation.findAll({
            order: [['updated_at', 'DESC']]
        });

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
            lastUpdated: d.updated_at ? new Date(d.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        }));

        res.status(200).json({ success: true, data: docsMapped });
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createDocument = async (req, res) => {
    try {
        const { title, category, description, content, author = 'Current User' } = req.body;

        const doc = await Documentation.create({
            title,
            category,
            description,
            content,
            author,
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
