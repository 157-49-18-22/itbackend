const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const basename = path.basename(__filename);
const db = {};

// Import database configuration
const config = require('../config/config.json')[process.env.NODE_ENV || 'development'];

// Initialize Sequelize
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    logging: config.logging || false,
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

// Import the Deployment model first
const Deployment = require('./deployment.model');

// Add it to the db object
db.Deployment = Deployment;

// Import all models from sql directory
const modelDir = path.join(__dirname, 'sql');

// Load all models from the sql directory
fs.readdirSync(modelDir)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-10) === '.model.js' &&
      !file.includes('.test.js')
    );
  })
  .forEach(file => {
    const modelPath = path.join(modelDir, file);
    const modelModule = require(modelPath);
    // Handle both module.exports = model and module.exports = (sequelize, DataTypes) => ...
    const model = typeof modelModule === 'function' 
      ? modelModule(sequelize, Sequelize.DataTypes)
      : modelModule;
    db[model.name] = model;
  });

// Set up model associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Add Deployment model to db object
db.Deployment = Deployment;

// Set up associations
if (db.Project && db.Deployment) {
  // A Project has many Deployments
  db.Project.hasMany(db.Deployment, {
    foreignKey: 'projectId',
    as: 'deployments'
  });
  
  // A Deployment belongs to a Project
  db.Deployment.belongsTo(db.Project, {
    foreignKey: 'projectId',
    as: 'project'
  });
}

if (db.User && db.Deployment) {
  // A User has many Deployments
  db.User.hasMany(db.Deployment, {
    foreignKey: 'deployedBy',
    as: 'deployments'
  });
  
  // A Deployment belongs to a User (who deployed it)
  db.Deployment.belongsTo(db.User, {
    foreignKey: 'deployedBy',
    as: 'deployedByUser'
  });
}

module.exports = db;
