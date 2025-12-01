const { sequelize } = require('../config/database.sql');
const models = require('../models/sql');

const resetDatabase = async () => {
  try {
    console.log('⚠️  WARNING: This will delete all data!');
    console.log('🔄 Resetting database...');
    
    // Drop all tables and recreate
    await sequelize.sync({ force: true });
    
    console.log('✅ Database reset completed!');
    console.log('👉 Run "npm run seed" to add sample data\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Reset failed:', error.message);
    process.exit(1);
  }
};

resetDatabase();
