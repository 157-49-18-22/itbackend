const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance for SQL database
let sequelize;

if (process.env.DATABASE_URL) {
  // Use DATABASE_URL if available (for production/Render)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    host: process.env.DB_HOST || undefined, // Force hostname if needed
    dialectModule: require('pg'),
    native: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  // Use individual credentials (for local development)
  sequelize = new Sequelize(
    process.env.DB_NAME || 'it_agency_pms',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: process.env.DB_DIALECT || 'mysql', // 'mysql' or 'postgres'
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: false,
        freezeTableName: true
      }
    }
  );
}

// Test connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ ${process.env.DB_DIALECT?.toUpperCase() || 'MySQL'} Database Connected Successfully`);

    // Sync models in development (creates tables if they don't exist)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false }); // Set to true to auto-update schema
      console.log('✅ Database tables synchronized');
    }
  } catch (error) {
    console.error('❌ Database Connection Error:');
    console.error('Error Message:', error.message);
    console.error('Error Details:', error);
    console.error('Connection Config:', {
      dialect: process.env.DB_DIALECT,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      hasPassword: !!process.env.DB_PASSWORD,
      hasDatabaseUrl: !!process.env.DATABASE_URL
    });
    // process.exit(1); // Removed to keep server alive without DB
  }
};

module.exports = { sequelize, connectDB };
