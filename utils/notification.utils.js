const { Notification } = require('../models/sql');

// Create notification
exports.createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    
    // Emit socket event if io is available
    if (global.io) {
      global.io.to(`user_${data.recipient}`).emit('new_notification', notification);
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Create multiple notifications
exports.createBulkNotifications = async (notifications) => {
  try {
    const created = await Notification.insertMany(notifications);
    
    // Emit socket events
    if (global.io) {
      created.forEach(notif => {
        global.io.to(`user_${notif.recipient}`).emit('new_notification', notif);
      });
    }
    
    return created;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    return [];
  }
};

// Notification templates
exports.notificationTemplates = {
  taskAssigned: (task, assignee) => ({
    type: 'Task',
    title: 'New task assigned to you',
    description: task.title,
    recipient: assignee,
    sender: task.reporter,
    relatedTask: task._id,
    relatedProject: task.project,
    actionUrl: `/tasks/${task._id}`
  }),
  
  approvalRequest: (approval, recipient) => ({
    type: 'Approval',
    title: 'Approval required',
    description: approval.title,
    recipient: recipient,
    sender: approval.requestedBy,
    relatedApproval: approval._id,
    relatedProject: approval.project,
    priority: approval.priority.toLowerCase(),
    actionUrl: `/approvals/${approval._id}`
  }),
  
  messageReceived: (message, recipient) => ({
    type: 'Message',
    title: 'New message',
    description: message.subject || message.content.substring(0, 50),
    recipient: recipient,
    sender: message.sender,
    actionUrl: `/messages/${message.thread}`
  }),
  
  mentionInComment: (task, mentionedUser, commenter) => ({
    type: 'Mention',
    title: 'You were mentioned in a comment',
    description: `@${commenter.name} mentioned you in ${task.title}`,
    recipient: mentionedUser,
    sender: commenter._id,
    relatedTask: task._id,
    relatedProject: task.project,
    actionUrl: `/tasks/${task._id}`
  }),
  
  projectStatusChange: (project, recipient, newStatus) => ({
    type: 'System',
    title: 'Project status updated',
    description: `${project.name} is now ${newStatus}`,
    recipient: recipient,
    relatedProject: project._id,
    actionUrl: `/projects/${project._id}`
  })
};
