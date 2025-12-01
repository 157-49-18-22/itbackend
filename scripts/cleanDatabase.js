const { sequelize } = require('../config/database.sql');

const cleanDatabase = async () => {
  try {
    console.log('🔄 Cleaning database...');
    
    // Disable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Drop all tables
    const tables = [
      'stage_transitions',
      'task_checklists', 
      'audit_logs',
      'sprints',
      'calendar_events',
      'time_tracking',
      'activities',
      'notifications',
      'messages',
      'deliverables',
      'approvals',
      'tasks',
      'projects',
      'clients',
      'users',
      'team_members'
    ];
    
    for (const table of tables) {
      await sequelize.query(`DROP TABLE IF EXISTS \`${table}\``);
      console.log(`✅ Dropped table: ${table}`);
    }
    
    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('✅ Database cleaned successfully!');
    console.log('👉 Now run: npm run migrate\n');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Clean failed:', error.message);
    process.exit(1);
  }
};

cleanDatabase();
