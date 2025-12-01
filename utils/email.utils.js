const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send email
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `${process.env.APP_NAME || 'IT Agency PMS'} <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

// Email templates
const emailTemplates = {
  taskAssigned: (user, task, project) => ({
    subject: `New Task Assigned: ${task.title}`,
    html: `
      <h2>New Task Assigned</h2>
      <p>Hi ${user.name},</p>
      <p>You have been assigned a new task:</p>
      <h3>${task.title}</h3>
      <p><strong>Project:</strong> ${project.name}</p>
      <p><strong>Due Date:</strong> ${task.dueDate || 'Not set'}</p>
      <p><strong>Priority:</strong> ${task.priority}</p>
      <p><strong>Description:</strong> ${task.description}</p>
      <p><a href="${process.env.CLIENT_URL}/tasks/${task.id}">View Task</a></p>
    `
  }),

  approvalRequest: (user, approval, project) => ({
    subject: `Approval Required: ${approval.title}`,
    html: `
      <h2>Approval Request</h2>
      <p>Hi ${user.name},</p>
      <p>Your approval is required for:</p>
      <h3>${approval.title}</h3>
      <p><strong>Project:</strong> ${project.name}</p>
      <p><strong>Type:</strong> ${approval.type}</p>
      <p><strong>Priority:</strong> ${approval.priority}</p>
      <p><strong>Due Date:</strong> ${approval.dueDate || 'Not set'}</p>
      <p><a href="${process.env.CLIENT_URL}/approvals/${approval.id}">Review & Approve</a></p>
    `
  }),

  stageTransition: (user, project, fromStage, toStage) => ({
    subject: `Project Stage Transition: ${project.name}`,
    html: `
      <h2>Project Stage Transition</h2>
      <p>Hi ${user.name},</p>
      <p>The project <strong>${project.name}</strong> has transitioned:</p>
      <p><strong>From:</strong> ${fromStage}</p>
      <p><strong>To:</strong> ${toStage}</p>
      <p><a href="${process.env.CLIENT_URL}/projects/${project.id}">View Project</a></p>
    `
  }),

  deadlineReminder: (user, task, daysLeft) => ({
    subject: `Deadline Reminder: ${task.title}`,
    html: `
      <h2>Deadline Reminder</h2>
      <p>Hi ${user.name},</p>
      <p>This is a reminder that the following task is due in ${daysLeft} day(s):</p>
      <h3>${task.title}</h3>
      <p><strong>Due Date:</strong> ${task.dueDate}</p>
      <p><strong>Status:</strong> ${task.status}</p>
      <p><a href="${process.env.CLIENT_URL}/tasks/${task.id}">View Task</a></p>
    `
  }),

  projectCompleted: (user, project) => ({
    subject: `Project Completed: ${project.name}`,
    html: `
      <h2>Project Completed</h2>
      <p>Hi ${user.name},</p>
      <p>Congratulations! The project <strong>${project.name}</strong> has been completed.</p>
      <p><strong>Completion Date:</strong> ${project.actualEndDate}</p>
      <p><a href="${process.env.CLIENT_URL}/projects/${project.id}">View Project</a></p>
    `
  }),

  clientWelcome: (client, project) => ({
    subject: `Welcome to ${project.name}`,
    html: `
      <h2>Welcome!</h2>
      <p>Hi ${client.name},</p>
      <p>Welcome to the IT Agency Project Management System.</p>
      <p>Your project <strong>${project.name}</strong> has been initiated.</p>
      <p>You can track progress, review deliverables, and approve work through your client portal.</p>
      <p><a href="${process.env.CLIENT_URL}/client/dashboard">Access Client Portal</a></p>
      <p>If you have any questions, please don't hesitate to contact us.</p>
    `
  })
};

// Send notification email
const sendNotificationEmail = async (type, data) => {
  const template = emailTemplates[type];
  if (!template) {
    console.error(`Email template '${type}' not found`);
    return { success: false, error: 'Template not found' };
  }

  const emailContent = template(...Object.values(data));
  
  return await sendEmail({
    to: data.user?.email || data.client?.email,
    ...emailContent
  });
};

module.exports = {
  sendEmail,
  sendNotificationEmail,
  emailTemplates
};
