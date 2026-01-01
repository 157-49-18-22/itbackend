const { sequelize } = require('../config/database.sql');
const os = require('os');

exports.getEnvironmentInfo = async (req, res) => {
    try {
        // Get Database Version
        const [results] = await sequelize.query('SELECT VERSION() as version');
        const dbVersion = results[0].version;

        // Get System Info
        const systemInfo = {
            nodeVersion: process.version,
            platform: os.platform(),
            release: os.release(),
            uptime: process.uptime(),
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            architecture: os.arch(),
            cpus: os.cpus().length,
            hostname: os.hostname(),
            networkInterfaces: os.networkInterfaces()
        };

        res.status(200).json({
            success: true,
            database: {
                type: 'MySQL',
                version: dbVersion,
                connected: true
            },
            server: {
                status: 'Running',
                port: process.env.PORT || 5000,
                baseUrl: process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 5000}`
            },
            system: systemInfo,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching environment info:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch environment info',
            error: error.message
        });
    }
};
