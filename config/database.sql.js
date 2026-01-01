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
  // Use individual credentials (for local development with MySQL)
  sequelize = new Sequelize(
    process.env.DB_NAME || 'it_agency_pms',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
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
    }
  );
}

// Test connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    const dbType = process.env.DATABASE_URL ? 'PostgreSQL' : (process.env.DB_DIALECT?.toUpperCase() || 'MySQL');
    console.log(`✅ ${dbType} Database Connected Successfully`);

    // Sync models in development (creates tables if they don't exist)
    // Sync models (creates tables/columns if they don't exist)
    // ENABLED GLOBALLY TEMPORARILY to ensure schema updates on Render
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synchronized (Alter enabled)');
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
