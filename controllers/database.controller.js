const { sequelize } = require('../config/database.sql');

exports.getDatabaseSchema = async (req, res) => {
    try {
        // 1. Get Database Info (Version, Name, etc.)
        const [versionResult] = await sequelize.query('SELECT VERSION() as version');
        const dbVersion = versionResult[0].version;

        const [dbNameResult] = await sequelize.query('SELECT DATABASE() as name');
        const dbName = dbNameResult[0].name;

        // 2. Get Tables
        const [tablesResult] = await sequelize.query('SHOW TABLES');
        const tableNames = tablesResult.map(row => Object.values(row)[0]);

        const tables = [];

        // 3. For each table, get details (Columns, Row Count)
        for (const tableName of tableNames) {
            // Row Count
            const [countResult] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tableName}`);
            const rowCount = countResult[0].count;

            // Columns
            const [columnsResult] = await sequelize.query(`SHOW COLUMNS FROM ${tableName}`);
            const columns = columnsResult.map(col => ({
                name: col.Field,
                type: col.Type,
                nullable: col.Null === 'YES',
                primaryKey: col.Key === 'PRI',
                default: col.Default,
                extra: col.Extra,
                description: '' // Metadata usually not available in standard SHOW COLUMNS without comments
            }));

            // Indexes/Keys (Optional for now, but good to have)
            const [indexesResult] = await sequelize.query(`SHOW INDEX FROM ${tableName}`);
            // Simple index mapping
            const indexes = [];
            const indexMap = {};
            indexesResult.forEach(idx => {
                if (!indexMap[idx.Key_name]) {
                    indexMap[idx.Key_name] = { name: idx.Key_name, columns: [], unique: idx.Non_unique === 0 };
                }
                indexMap[idx.Key_name].columns.push(idx.Column_name);
            });
            for (const key in indexMap) {
                if (key !== 'PRIMARY') { // detailed section usually separates PK
                    indexes.push(indexMap[key]);
                }
            }

            tables.push({
                name: tableName,
                description: `Table ${tableName}`, // Placeholder or fetch from comment if possible
                rowCount: rowCount,
                columns: columns,
                indexes: indexes,
                relationships: [] // Complex to derive automatically without FK parsing, skipping for now or adding basic FK detection
            });
        }

        const databaseInfo = {
            name: dbName,
            type: 'MySQL',
            version: dbVersion,
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || '3306'
        };

        res.status(200).json({
            success: true,
            info: databaseInfo,
            tables: tables
        });

    } catch (error) {
        console.error('Error fetching database schema:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch database schema',
            error: error.message
        });
    }
};
