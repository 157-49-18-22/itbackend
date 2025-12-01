const { sequelize } = require('../config/database.sql');
const { QueryTypes } = require('sequelize');

async function syncDatabase() {
  try {
    // First, check the current status values in the tasks table
    const statuses = await sequelize.query(
      'SELECT DISTINCT status FROM tasks',
      { type: QueryTypes.SELECT }
    );
    
    console.log('Current status values in tasks table:', statuses.map(s => s.status));
    
    // Temporarily modify the tasks table to allow any status value
    await sequelize.query('ALTER TABLE tasks MODIFY COLUMN status VARCHAR(50)');
    
    // Update any invalid status values to 'to_do'
    const [results] = await sequelize.query(
      `UPDATE tasks SET status = 'to_do' 
       WHERE status NOT IN ('to_do', 'in_progress', 'in_review', 'done', 'blocked')`
    );
    
    console.log(`Updated ${results.affectedRows} rows with invalid status values`);
    
    // Now sync all models with force: false to avoid data loss
    console.log('Syncing database models...');
    await sequelize.sync({ alter: true });
    
    console.log('Database synchronized successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('Error syncing database:');
    console.error(error);
    
    // If we get here, something went wrong with the sync
    console.log('\nPlease check the error above and try one of these solutions:');
    console.log('1. Backup your database and run with force: true (will drop and recreate tables)');
    console.log('2. Manually update the status values in the tasks table to match the enum values');
    console.log('3. Contact your database administrator for assistance');
    
    process.exit(1);
  }
}

// Run the sync
syncDatabase();
