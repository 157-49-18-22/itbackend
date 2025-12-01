const { Task, Project, User, File, Comment, ProjectMember } = require('../models');
const { Op } = require('sequelize');
const { uploadFile, deleteFile } = require('../utils/s3.utils');
const { sendNotification } = require('../utils/notification.utils');

// Get all UI/UX tasks for a project
exports.getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    const tasks = await Task.findAll({
      where: {
        projectId,
        type: 'uiux'
      },
      include: [
        {
          model: User,
          as: 'assignedToUser',
          attributes: ['id', 'name', 'email', 'avatar']
        },
        {
          model: File,
          as: 'attachments'
        },
        {
          model: Comment,
          include: [{
            model: User,
            attributes: ['id', 'name', 'avatar']
          }]
        }
      ],
      order: [['dueDate', 'ASC']]
    });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching UI/UX tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

// Get all UI/UX tasks assigned to the current user
exports.getUserTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: {
        assignedTo: req.user.id,
        type: 'uiux'
      },
      include: [
        {
          model: Project,
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'assignedToUser',
          attributes: ['id', 'name', 'email', 'avatar']
        },
        {
          model: File,
          as: 'attachments'
        },
        {
          model: Comment,
          include: [{
            model: User,
            attributes: ['id', 'name', 'avatar']
          }]
        }
      ],
      order: [['dueDate', 'ASC']]
    });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

// Create a new UI/UX task
exports.createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, dueDate, priority, assignedTo, checklist } = req.body;

    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      status: 'not_started',
      type: 'uiux',
      projectId,
      createdBy: req.user.id,
      assignedTo
    });

    // Create checklist items if provided
    if (checklist && checklist.length > 0) {
      await Promise.all(checklist.map(item =>
        task.createChecklistItem({
          text: item.text,
          completed: item.completed || false
        })
      ));
    }

    // Send notification to assigned user
    if (assignedTo) {
      await sendNotification({
        userId: assignedTo,
        title: 'New Task Assigned',
        message: `You have been assigned a new task: ${title}`,
        type: 'task_assigned',
        referenceId: task.id
      });
    }

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task' });
  }
};

// Update task status
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = status;
    await task.save();

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      projectId: task.projectId,
      taskId: task.id,
      action: 'update_task_status',
      details: { status }
    });

    res.json(task);
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Error updating task status' });
  }
};

// Upload task attachment
exports.uploadAttachment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to S3
    const uploadResult = await uploadFile(file, {
      folder: `projects/${req.project.id}/tasks/${taskId}/attachments`
    });

    // Save file record
    const attachment = await File.create({
      name: file.originalname,
      url: uploadResult.Location,
      key: uploadResult.Key,
      size: file.size,
      mimeType: file.mimetype,
      taskId,
      uploadedBy: req.user.id
    });

    res.status(201).json(attachment);
  } catch (error) {
    console.error('Error uploading attachment:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
};

// Log work time
exports.logWorkTime = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { hours, minutes, description, date } = req.body;

    const timeEntry = await TimeEntry.create({
      taskId,
      userId: req.user.id,
      hours: parseFloat(hours) + (parseFloat(minutes) / 60),
      description,
      date: date || new Date()
    });

    res.status(201).json(timeEntry);
  } catch (error) {
    console.error('Error logging work time:', error);
    res.status(500).json({ message: 'Error logging work time' });
  }
};

// Add comment to task
exports.addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content, parentId } = req.body;

    const comment = await Comment.create({
      content,
      taskId,
      userId: req.user.id,
      parentId
    });

    // Get comment with user data
    const newComment = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        attributes: ['id', 'name', 'avatar']
      }]
    });

    // Notify mentioned users
    const mentionRegex = /@([\w-]+)/g;
    let match;
    const mentionedUsernames = new Set();

    while ((match = mentionRegex.exec(content)) !== null) {
      mentionedUsernames.add(match[1]);
    }

    if (mentionedUsernames.size > 0) {
      const mentionedUsers = await User.findAll({
        where: {
          username: {
            [Op.in]: Array.from(mentionedUsernames)
          }
        }
      });

      await Promise.all(mentionedUsers.map(user =>
        sendNotification({
          userId: user.id,
          title: 'You were mentioned in a comment',
          message: `${req.user.name} mentioned you in a comment`,
          type: 'mention',
          referenceId: taskId
        })
      ));
    }

    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
};

// Get task analytics
exports.getTaskAnalytics = async (req, res) => {
  try {
    const { projectId } = req.params;

    const totalTasks = await Task.count({ where: { projectId, type: 'uiux' } });
    const completedTasks = await Task.count({
      where: {
        projectId,
        type: 'uiux',
        status: 'completed'
      }
    });

    const inProgressTasks = await Task.count({
      where: {
        projectId,
        type: 'uiux',
        status: 'in_progress'
      }
    });

    const overdueTasks = await Task.count({
      where: {
        projectId,
        type: 'uiux',
        dueDate: { [Op.lt]: new Date() },
        status: { [Op.not]: 'completed' }
      }
    });

    // Time spent by task
    const timeByTask = await TimeEntry.findAll({
      attributes: [
        'taskId',
        [sequelize.fn('SUM', sequelize.col('hours')), 'totalHours']
      ],
      include: [{
        model: Task,
        where: { projectId, type: 'uiux' },
        attributes: ['title']
      }],
      group: ['taskId'],
      raw: true
    });

    res.json({
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      timeByTask
    });
  } catch (error) {
    console.error('Error fetching task analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
};
