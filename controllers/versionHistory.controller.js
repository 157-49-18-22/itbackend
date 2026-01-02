const { VersionHistory } = require('../models/sql');

exports.getAllVersions = async (req, res) => {
    try {
        const versions = await VersionHistory.findAll({
            order: [['release_date', 'DESC'], ['release_time', 'DESC']]
        });

        // Map Sequelize instances to plain objects for frontend
        const versionsMapped = versions.map(v => {
            const data = v.toJSON();
            return {
                id: data.id,
                version: data.version,
                type: data.type,
                title: data.title,
                description: data.description,
                author: data.author,
                date: data.release_date,
                time: data.release_time,
                branch: data.branch,
                commitHash: data.commit_hash,
                filesChanged: data.files_changed,
                additions: data.additions,
                deletions: data.deletions,
                changes: data.changes,
                status: data.status,
                deployedTo: data.deployed_to
            };
        });

        res.status(200).json({ success: true, data: versionsMapped });
    } catch (error) {
        console.error('Error fetching versions:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
