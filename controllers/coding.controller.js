const fs = require('fs');
const path = require('path');

// Helper to recursively walk directory
const walkDir = (dir, callback) => {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
};

exports.getCodingStats = async (req, res) => {
    try {
        const srcPath = path.join(__dirname, '../../src'); // Assumes backend/controllers
        const projectRoot = path.join(__dirname, '../../');

        let stats = {
            totalFiles: 0,
            jsFiles: 0,
            jsxFiles: 0,
            cssFiles: 0,
            linesOfCode: 0,
            components: 0
        };

        // Scan Src Directory
        if (fs.existsSync(srcPath)) {
            walkDir(srcPath, (filePath) => {
                const ext = path.extname(filePath).toLowerCase();
                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.split('\n').length;

                stats.totalFiles++;
                stats.linesOfCode += lines;

                if (ext === '.js') stats.jsFiles++;
                if (ext === '.jsx') {
                    stats.jsxFiles++;
                    // Crude component guess: File starts with Capital and has Function/const export
                    const fileName = path.basename(filePath);
                    if (fileName[0] === fileName[0].toUpperCase()) stats.components++;
                }
                if (ext === '.css') stats.cssFiles++;
            });
        }

        // Check Configuration
        const configPath = path.join(projectRoot, 'eslint.config.js');
        let activeRules = [];
        let configExists = false;

        if (fs.existsSync(configPath)) {
            configExists = true;
            const configContent = fs.readFileSync(configPath, 'utf8');

            // Simple parsing for display
            if (configContent.includes('no-unused-vars')) activeRules.push('no-unused-vars');
            if (configContent.includes('react-hooks')) activeRules.push('react-hooks/rules-of-hooks');
            if (configContent.includes('react-refresh')) activeRules.push('react-refresh/only-export-components');
            if (configContent.includes('prettier')) activeRules.push('prettier/prettier');
        }

        const healthScore = Math.min(100, (
            (configExists ? 30 : 0) +
            (stats.jsxFiles > 0 ? 20 : 0) +
            (stats.cssFiles > 0 ? 10 : 0) +
            (stats.linesOfCode > 100 ? 20 : 0) +
            (stats.components > 5 ? 20 : 0)
        ));

        res.status(200).json({
            success: true,
            stats,
            config: {
                eslint: configExists,
                prettier: fs.existsSync(path.join(projectRoot, '.prettierrc')),
                editorConfig: fs.existsSync(path.join(projectRoot, '.editorconfig')),
                activeRules
            },
            healthScore,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error fetching coding stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch coding stats',
            error: error.message
        });
    }
};
