const { Activity } = require('../models/sql');

// Log activity
exports.logActivity = async (data) => {
  try {
    const activity = await Activity.create(data);
    
    // Emit socket event for real-time activity feed
    if (global.io && data.project) {
      global.io.to(`project_${data.project}`).emit('new_activity', activity);
    }
    
    return activity;
  } catch (error) {
    console.error('Error logging activity:', error);
    return null;
  }
};

// Activity templates
exports.activityTemplates = {
  taskCreated: (task, user) => ({
    type: 'Task',
    title: `Task created: ${task.title}`,
    description: task.description,
    user: user._id,
    project: task.project,
    relatedTask: task._id,
    metadata: {
      taskId: task._id,
      status: task.status,
      priority: task.priority
    }
  }),
  
  taskStatusChanged: (task, user, oldStatus, newStatus) => ({
    type: 'Task',
    title: `Task moved to ${newStatus}`,
    description: task.title,
    user: user._id,
    project: task.project,
    relatedTask: task._id,
    metadata: {
      oldStatus,
      newStatus
    }
  }),
  
  approvalApproved: (approval, user) => ({
    type: 'Approval',
    title: `Approval approved: ${approval.title}`,
    description: approval.notes,
    user: user._id,
    project: approval.project,
    relatedApproval: approval._id,
    metadata: {
      approvalType: approval.type
    }
  }),
  
  codeCommit: (commitData, user, project) => ({
    type: 'Commit',
    title: commitData.message,
    description: `${commitData.filesChanged} files changed`,
    user: user._id,
    project: project._id,
    metadata: {
      commitHash: commitData.hash,
      branch: commitData.branch,
      filesChanged: commitData.filesChanged
    }
  }),
  
  commentAdded: (task, user, comment) => ({
    type: 'Comment',
    title: `Comment added on ${task.title}`,
    description: comment,
    user: user._id,
    project: task.project,
    relatedTask: task._id
  }),
  
  projectCreated: (project, user) => ({
    type: 'Project',
    title: `Project created: ${project.name}`,
    description: project.description,
    user: user._id,
    project: project._id,
    metadata: {
      status: project.status,
      priority: project.priority
    }
  }),
  
  deploymentCompleted: (deployment, user, project) => ({
    type: 'Deployment',
    title: `Deployment completed`,
    description: `${deployment.environment} • ${deployment.version}`,
    user: user._id,
    project: project._id,
    metadata: {
      environment: deployment.environment,
      version: deployment.version,
      status: deployment.status
    }
  })
};
