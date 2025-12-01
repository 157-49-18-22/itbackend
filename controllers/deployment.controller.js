const db = require('../models');
const { Op, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Import models directly from their files
const Deployment = require('../models/deployment.model');
const Project = require('../models/Project.model');
const User = require('../models/User.model');

// Also get models from db for fallback
const dbDeployment = db.Deployment || db.deployment;
const dbProject = db.Project || db.project;
const dbUser = db.User || db.user;

// Create a new deployment
const createDeployment = async (req, res) => {
  let transaction;
  
  try {
    const { projectId, environment = 'development', branch, commitHash, commitMessage } = req.body;
    
    // Basic validation - only branch is required now
    if (!branch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Branch is required' 
      });
    }

    // Start a new transaction
    transaction = await db.sequelize.transaction();

    // Prepare deployment data
    const deploymentData = {
      projectId: projectId || null,
      environment,
      branch,
      commitHash: commitHash || null,
      commitMessage: commitMessage || null,
      status: 'pending',
      deployedBy: req.user.id,
      startedAt: new Date()
    };

    // Create the deployment within a transaction
    const deployment = await Deployment.create(deploymentData, { transaction });
    
    // Fetch the deployment with specific fields
    const result = await Deployment.findByPk(deployment.id, {
      attributes: ['id', 'projectId', 'environment', 'branch', 'commitHash', 'commitMessage', 'status', 'startedAt', 'completedAt', 'deployedBy', 'createdAt', 'updatedAt'],
      transaction
    });
    
    if (!result) {
      throw new Error('Failed to retrieve created deployment');
    }
    
    // If you need to include associations, you can add them like this:
    // const result = await Deployment.findByPk(deployment.id, {
    //   include: [
    //     { 
    //       model: models.Project || models.project,
    //       as: 'project',
    //       attributes: ['id', 'name']
    //     },
    //     {
    //       model: models.User || models.user,
    //       as: 'deployedBy',
    //       attributes: ['id', 'name', 'email']
    //     }
    //   ],
    //   transaction
    // });

    // If everything went well, commit the transaction
    await transaction.commit();

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    // Only rollback if the transaction was created
    if (transaction) {
      await transaction.rollback();
    }
    
    console.error('Error creating deployment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create deployment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all deployments
const getDeployments = async (req, res) => {
  try {
    const { projectId, environment, status, limit = 10, offset = 0 } = req.query;
    
    // Build the where clause based on query parameters
    const where = {
      deletedAt: null // Only non-deleted deployments
    };
    if (projectId) where.projectId = projectId;
    if (environment) where.environment = environment;
    if (status) where.status = status;

    try {
      // Get models from db object with fallback
      const deploymentModel = Deployment || dbDeployment;
      const projectModel = Project || dbProject;
      const userModel = User || dbUser;

      // Set up includes for related models
      const include = [
        {
          model: projectModel,
          as: 'project',
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: userModel,
          as: 'deployedBy',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ];

      // Get deployments with associated data
      const { count, rows: deployments } = await deploymentModel.findAndCountAll({
        where,
        limit: Math.min(parseInt(limit) || 10, 100),
        offset: parseInt(offset) || 0,
        order: [['createdAt', 'DESC']],
        include: include,
        distinct: true
      });

      // Format the response to match frontend expectations
      const formattedDeployments = deployments.map(deploy => ({
        id: deploy.id,
        projectId: deploy.projectId,
        project: deploy.project ? {
          id: deploy.project.id,
          name: deploy.project.name
        } : null,
        environment: deploy.environment,
        branch: deploy.branch,
        commitHash: deploy.commitHash,
        commitMessage: deploy.commitMessage,
        status: deploy.status,
        startedAt: deploy.startedAt,
        completedAt: deploy.completedAt,
        deployedBy: deploy.deployedBy,
        deployedByUser: deploy.deployedByUser ? {
          id: deploy.deployedByUser.id,
          name: deploy.deployedByUser.name,
          email: deploy.deployedByUser.email
        } : null,
        createdAt: deploy.createdAt,
        updatedAt: deploy.updatedAt
      }));

      // Send the successful response
      return res.status(200).json({
        success: true,
        data: formattedDeployments,
        pagination: {
          total: count,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    } catch (innerError) {
      console.error('Inner error in getDeployments:', innerError);
      throw innerError; // Re-throw to be caught by the outer catch
    }
  } catch (error) {
    console.error('Error fetching deployments:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      models: {
        Deployment: !!Deployment,
        Project: !!Project,
        User: !!User,
        dbDeployment: !!dbDeployment,
        dbProject: !!dbProject,
        dbUser: !!dbUser
      }
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deployments',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : 'Internal server error'
    });
  }
};

// Get deployment by ID
const getDeploymentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the Project and User models from the models object
    const Project = models.Project || models.project;
    const User = models.User || models.user;
    
    const deployment = await Deployment.findByPk(id, {
      include: [
        { 
          model: Project,
          as: 'project',
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: User,
          as: 'deployedByUser',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ]
    });

    if (!deployment) {
      return res.status(404).json({
        success: false,
        message: 'Deployment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: deployment
    });
  } catch (error) {
    console.error('Error fetching deployment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deployment',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : 'Internal server error'
    });
  }
};

// Update deployment status
const updateDeploymentStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { status, completedAt, logs } = req.body;

    const deployment = await Deployment.findByPk(id, { transaction });
    if (!deployment) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Deployment not found'
      });
    }

    // Update deployment status
    if (status) deployment.status = status;
    if (completedAt) deployment.completedAt = completedAt;
    if (logs) deployment.logs = logs;
    
    await deployment.save({ transaction });
    await transaction.commit();

    // Fetch the updated deployment with associations
    const updatedDeployment = await Deployment.findByPk(id, {
      include: [
        { 
          model: Project,
          as: 'project',
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: User,
          as: 'deployedByUser',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: updatedDeployment
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating deployment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update deployment status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete a deployment (soft delete)
const deleteDeployment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    const deployment = await Deployment.findByPk(id, { transaction });
    if (!deployment) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Deployment not found'
      });
    }

    await deployment.destroy({ transaction });
    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Deployment deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting deployment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete deployment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  createDeployment,
  getDeployments,
  getDeploymentById,
  updateDeploymentStatus,
  deleteDeployment
};
