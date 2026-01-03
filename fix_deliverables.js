const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    'it_agency_pms', // DB_NAME
    'root',          // DB_USER
    'gullygang123!', // DB_PASSWORD
    {
        host: 'localhost',
        dialect: 'mysql',
        logging: console.log
    }
);

async function fixDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Check current columns of deliverables
        const [results] = await sequelize.query('DESCRIBE deliverables;');
        console.log('Current schema:', results);

        // Modify status column to be VARCHAR(50) to accept 'In Review' and other values safely
        // This removes the restrictive ENUM check at the database level
        console.log('Modifying status column...');
        await sequelize.query("ALTER TABLE deliverables MODIFY COLUMN status VARCHAR(50) DEFAULT 'Draft';");

        console.log('Successfully updated status column to VARCHAR(50)');

    } catch (error) {
        console.error('Unable to connect to the database or run query:', error);
    } finally {
        await sequelize.close();
    }
}

fixDatabase();
