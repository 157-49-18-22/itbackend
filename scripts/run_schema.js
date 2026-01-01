const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.production') });

const runMigration = async () => {
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
        console.error('❌ Error: DATABASE_URL is not defined in .env.production');
        console.log('Please set DATABASE_URL in your environment variables before running this script.');
        process.exit(1);
    }

    // Configure connection to PostgreSQL
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false // Required for Render/Cloud databases
        }
    });

    try {
        console.log('🔌 Connecting to database...');
        await client.connect();
        console.log('✅ Connected successfully.');

        // Read the SQL file
        const sqlPath = path.join(__dirname, 'schema.sql');
        console.log(`📖 Reading SQL schema from: ${sqlPath}`);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Execute the SQL
        console.log('🚀 Executing SQL schema migration...');
        console.log('----------------------------------------');

        // We execute the whole file as a single query block
        await client.query(sql);

        console.log('----------------------------------------');
        console.log('✅ Migration completed successfully!');
        console.log('🎉 All tables have been created.');

    } catch (error) {
        console.error('❌ Migration Failed:', error);
    } finally {
        await client.end();
        console.log('🔌 Connection closed.');
    }
};

runMigration();
