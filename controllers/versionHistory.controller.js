const { VersionHistory } = require('../models/sql');

exports.getAllVersions = async (req, res) => {
    try {
        const versions = await VersionHistory.findAll({
            order: [['release_date', 'DESC'], ['release_time', 'DESC']]
        });

        // Map snake_case to camelCase
        const versionsMapped = versions.map(v => ({
            id: v.id,
            version: v.version,
            type: v.type,
            title: v.title,
            description: v.description,
            author: v.author,
            date: v.release_date,
            time: v.release_time,
            branch: v.branch,
            commitHash: v.commit_hash,
            filesChanged: v.files_changed,
            additions: v.additions,
            deletions: v.deletions,
            changes: v.changes,
            status: v.status,
            deployedTo: v.deployed_to
        }));

        res.status(200).json({ success: true, data: versionsMapped });
    } catch (error) {
        console.error('Error fetching versions:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
