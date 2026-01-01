const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance for SQL database
let sequelize;

if (process.env.DATABASE_URL) {
  // Use DATABASE_URL if available (for production/Render with PostgreSQL)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    dialectModule: require('pg'),
    native: false,
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
  });
} else {
  // Use individual credentials (for local development or production without DATABASE_URL)

  // DEBUG: Log environment variables
  console.log('🔍 Database Config Debug:');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_PORT:', process.env.DB_PORT);
  console.log('DB_NAME:', process.env.DB_NAME);
  console.log('DB_USER:', process.env.DB_USER);
  console.log('DB_DIALECT:', process.env.DB_DIALECT);
  console.log('Has DB_PASSWORD:', !!process.env.DB_PASSWORD);

  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
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
  };

  // Add SSL for PostgreSQL (Supabase)
  if (process.env.DB_DIALECT === 'postgres') {
    dbConfig.dialectOptions = {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    };
    dbConfig.dialectModule = require('pg');
    dbConfig.native = false;
  }

  sequelize = new Sequelize(
    process.env.DB_NAME || 'it_agency_pms',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    dbConfig
  );
}

// Test connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    const dbType = process.env.DATABASE_URL ? 'PostgreSQL' : (process.env.DB_DIALECT?.toUpperCase() || 'MySQL');
    console.log(`✅ ${dbType} Database Connected Successfully`);

    // Sync models in development (creates tables if they don't exist)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false }); // Set to true to auto-update schema
      console.log('✅ Database tables synchronized');
    }
  } catch (error) {
    console.error('❌ Database Connection Error:', error.message);
    console.error('Full error:', error);
    // Don't exit in production to allow health checks
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

module.exports = { sequelize, connectDB };
