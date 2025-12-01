const { sequelize } = require('../config/database.sql');
const models = require('../models/sql');

const migrate = async () => {
  try {
    console.log('🔄 Starting database migration...');
    console.log(`📊 Database: ${process.env.DB_DIALECT || 'mysql'}`);
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Sync all models (creates tables)
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ All tables created/updated successfully');
    
    console.log('\n📋 Tables created:');
    console.log('  - users');
    console.log('  - clients');
    console.log('  - projects');
    console.log('  - tasks');
    console.log('  - approvals');
    console.log('  - deliverables');
    console.log('  - messages');
    console.log('  - notifications');
    console.log('  - activities');
    console.log('  - time_tracking');
    console.log('  - calendar_events');
    
    console.log('\n✅ Migration completed successfully!');
    console.log('👉 Run "npm run seed" to add sample data\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

migrate();
