const { Documentation } = require('../models/sql');

exports.getAllDocuments = async (req, res) => {
    try {
        const docs = await Documentation.findAll({
            order: [['last_updated', 'DESC']]
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
                lastUpdated: (data.last_updated || data.updatedAt || data.updated_at) ? new Date(data.last_updated || data.updatedAt || data.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
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
        console.log('Creating document with data:', req.body);
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

        console.log('Document created successfully:', doc.id);

        res.status(201).json({ success: true, message: 'Document created', data: doc });
    } catch (error) {
        console.error('Error creating document:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDocumentById = async (req, res) => {
    try {
        const doc = await Documentation.findByPk(req.params.id);
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }
        res.status(200).json({ success: true, data: doc });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateDocument = async (req, res) => {
    try {
        const { title, category, description, content, status } = req.body;
        const doc = await Documentation.findByPk(req.params.id);

        if (!doc) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        await doc.update({
            title: title !== undefined ? title : doc.title,
            category: category !== undefined ? category : doc.category,
            description: description !== undefined ? description : doc.description,
            content: content !== undefined ? content : doc.content,
            status: status !== undefined ? status : doc.status,
            last_updated: new Date()
        });

        res.status(200).json({ success: true, message: 'Document updated', data: doc });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.incrementViews = async (req, res) => {
    try {
        const doc = await Documentation.findByPk(req.params.id);
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }
        await doc.increment('views');
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const doc = await Documentation.findByPk(req.params.id);
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }
        await doc.destroy();
        res.status(200).json({ success: true, message: 'Document deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
