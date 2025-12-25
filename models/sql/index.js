const { sequelize } = require('../../config/database.sql');

// Import all models
const User = require('./User.model');
const Client = require('./Client.model');
const Project = require('./Project.model');
const Task = require('./Task.model');
const Approval = require('./Approval.model');
const Deliverable = require('./Deliverable.model');
const Message = require('./Message.model');
const Notification = require('./Notification.model');
const Activity = require('./Activity.model');
const TimeTracking = require('./TimeTracking.model');
const CalendarEvent = require('./CalendarEvent.model');
// NEW Models
const Sprint = require('./Sprint.model');
const AuditLog = require('./AuditLog.model');
const TaskChecklist = require('./TaskChecklist.model');
const StageTransition = require('./StageTransition.model');
const Prototype = require('./Prototype.model');
const Wireframe = require('./Wireframe.model');
const Mockup = require('./Mockup.model');
const CodeFile = require('./CodeFile.model');
const Deployment = require('../deployment.model');
const Bug = require('./Bug.model');
const BugComment = require('./BugComment.model');
const UAT = require('./UAT.model');
const TestCase = require('./TestCase.model');
const TestResult = require('./TestResult.model');
const Blocker = require('./Blocker.model');
const Feedback = require('./Feedback.model');

// Define relationships

// CodeFile relationships - Moved to CodeFile.model.js
// CodeFile.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
// CodeFile.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
// CodeFile.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

// User relationships
User.hasMany(Project, { foreignKey: 'projectManagerId', as: 'managedProjects' });
User.hasMany(Bug, { foreignKey: 'reported_by', as: 'reportedBugs' });
User.hasMany(Bug, { foreignKey: 'assigned_to', as: 'assignedBugs' });
User.hasMany(BugComment, { foreignKey: 'user_id', as: 'bugComments' });
User.hasMany(Task, { foreignKey: 'assigneeId', as: 'assignedTasks' });
User.hasMany(Task, { foreignKey: 'reporterId', as: 'reportedTasks' });
User.hasMany(Approval, { foreignKey: 'requestedById', as: 'requestedApprovals' });
User.hasMany(Approval, { foreignKey: 'requestedToId', as: 'receivedApprovals' });
User.hasMany(Deliverable, { foreignKey: 'uploadedById', as: 'uploadedDeliverables' });
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Notification, { foreignKey: 'recipientId', as: 'notifications' });
User.hasMany(Activity, { foreignKey: 'userId', as: 'activities' });
User.hasMany(TimeTracking, { foreignKey: 'userId', as: 'timeEntries' });
User.hasMany(CalendarEvent, { foreignKey: 'organizerId', as: 'organizedEvents' });
User.hasMany(UAT, { foreignKey: 'createdBy', as: 'createdUATs' });
User.hasMany(Prototype, { foreignKey: 'createdBy', as: 'createdPrototypes' });
User.hasMany(Prototype, { foreignKey: 'updatedBy', as: 'updatedPrototypes' });
User.hasMany(Wireframe, { foreignKey: 'createdBy', as: 'createdWireframes' });
User.hasMany(Wireframe, { foreignKey: 'updatedBy', as: 'updatedWireframes' });
User.hasMany(Mockup, { foreignKey: 'createdBy', as: 'createdMockups' });
User.hasMany(Mockup, { foreignKey: 'approvedBy', as: 'approvedMockups' });

// CodeFile relationships
User.hasMany(CodeFile, { foreignKey: 'createdBy', as: 'createdCodeFiles' });
User.hasMany(CodeFile, { foreignKey: 'updatedBy', as: 'updatedCodeFiles' });
User.hasMany(Deployment, { foreignKey: 'deployedBy', as: 'deployments' });
User.hasMany(TestCase, { foreignKey: 'createdBy', as: 'createdTestCases' });
User.hasMany(TestCase, { foreignKey: 'assignedTo', as: 'assignedTestCases' });

Project.hasMany(CodeFile, { foreignKey: 'projectId', as: 'codeFiles' });

// Client relationships
Client.hasMany(Project, { foreignKey: 'clientId', as: 'projects' });

// Project relationships
Project.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
Project.belongsTo(User, { foreignKey: 'projectManagerId', as: 'projectManager' });
Project.hasMany(Bug, { foreignKey: 'project_id', as: 'bugs' });
// Tasks association is defined in Project.model.js
Project.hasMany(Approval, { foreignKey: 'projectId', as: 'approvals' });
Project.hasMany(Deliverable, { foreignKey: 'projectId', as: 'deliverables' });
Project.hasMany(Message, { foreignKey: 'projectId', as: 'messages' });
Project.hasMany(Activity, { foreignKey: 'projectId', as: 'activities' });
Project.hasMany(TimeTracking, { foreignKey: 'projectId', as: 'timeEntries' });
Project.hasMany(CalendarEvent, { foreignKey: 'projectId', as: 'events' });
// These associations are now defined in the Project model's associate method
Project.hasMany(Prototype, { foreignKey: 'projectId', as: 'prototypes' });
Project.hasMany(Wireframe, { foreignKey: 'projectId', as: 'wireframes' });
// Mockup and Tasks associations are defined in Project.model.js
Project.hasMany(CodeFile, { foreignKey: 'projectId', as: 'files' });
Project.hasMany(Deployment, { foreignKey: 'projectId', as: 'deployments' });

// Task relationships - defined in Task.model.js
// Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' }); // Defined in Task.model.js
// Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' }); // Moved to Task.model.js
// Task.belongsTo(User, { foreignKey: 'reporterId', as: 'reporter' }); // Moved to Task.model.js
Task.hasMany(TimeTracking, { foreignKey: 'taskId', as: 'timeEntries' });

// UAT relationships
// Note: UAT associations are defined in the UAT model's associate method

// Approval relationships
Approval.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Approval.belongsTo(User, { foreignKey: 'requestedById', as: 'requestedBy' });
Approval.belongsTo(User, { foreignKey: 'requestedToId', as: 'requestedTo' });
Approval.belongsTo(Deliverable, { foreignKey: 'relatedDeliverableId', as: 'relatedDeliverable' });

// Deliverable relationships
Deliverable.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Deliverable.belongsTo(User, { foreignKey: 'uploadedById', as: 'uploadedBy' });

// Message relationships
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Notification relationships
Notification.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });
Notification.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Notification.belongsTo(Project, { foreignKey: 'relatedProjectId', as: 'relatedProject' });
Notification.belongsTo(Task, { foreignKey: 'relatedTaskId', as: 'relatedTask' });
Notification.belongsTo(Approval, { foreignKey: 'relatedApprovalId', as: 'relatedApproval' });

// Activity relationships
Activity.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Activity.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Activity.belongsTo(Task, { foreignKey: 'relatedTaskId', as: 'relatedTask' });
Activity.belongsTo(Approval, { foreignKey: 'relatedApprovalId', as: 'relatedApproval' });

// TimeTracking relationships
TimeTracking.belongsTo(User, { foreignKey: 'userId', as: 'user' });
TimeTracking.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
TimeTracking.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

// CalendarEvent relationships
CalendarEvent.belongsTo(User, { foreignKey: 'organizerId', as: 'organizer' });
CalendarEvent.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// NEW Model Relationships

// Sprint relationships
Sprint.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Project.hasMany(Sprint, { foreignKey: 'projectId', as: 'sprints' });

// AuditLog relationships
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });

// TaskChecklist relationships
TaskChecklist.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });
TaskChecklist.belongsTo(User, { foreignKey: 'completedById', as: 'completedBy' });
Task.hasMany(TaskChecklist, { foreignKey: 'taskId', as: 'checklists' });

// StageTransition relationships
StageTransition.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
StageTransition.belongsTo(User, { foreignKey: 'requestedById', as: 'requestedBy' });
StageTransition.belongsTo(User, { foreignKey: 'approvedById', as: 'approvedBy' });
Project.hasMany(StageTransition, { foreignKey: 'projectId', as: 'transitions' });

// Wireframe relationships
// Wireframe.belongsTo(Project, { foreignKey: 'projectId', as: 'project' }); // Moved to Wireframe.model.js
// Wireframe.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' }); // Moved to Wireframe.model.js

// Mockup relationships - Moved to Mockup.model.js
// Mockup.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
// Mockup.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
// Mockup.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

// Bug relationships
Bug.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
Bug.belongsTo(User, { foreignKey: 'reported_by', as: 'reportedBy' });
Bug.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignedTo' });
// Note: Project.hasMany(Bug) is already defined above, no need to define it again
Project.hasMany(TestCase, { foreignKey: 'projectId', as: 'testCases' });

// BugComment relationships
// Note: BugComment.belongsTo(Bug) is defined in BugComment.model.js
BugComment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Blocker relationships
Blocker.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Blocker.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });
Blocker.belongsTo(User, { foreignKey: 'reportedBy', as: 'reporter' });
Blocker.belongsTo(User, { foreignKey: 'resolvedBy', as: 'resolver' });
Project.hasMany(Blocker, { foreignKey: 'projectId', as: 'blockers' });
User.hasMany(Blocker, { foreignKey: 'reportedBy', as: 'reportedBlockers' });

// Feedback relationships
Feedback.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Feedback.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });
Feedback.belongsTo(User, { foreignKey: 'reviewerId', as: 'reviewer' });
Feedback.belongsTo(User, { foreignKey: 'developerId', as: 'developer' });
Project.hasMany(Feedback, { foreignKey: 'projectId', as: 'feedbacks' });
User.hasMany(Feedback, { foreignKey: 'reviewerId', as: 'givenFeedbacks' });
User.hasMany(Feedback, { foreignKey: 'developerId', as: 'receivedFeedbacks' });

// Initialize models object
const models = {
  sequelize,
  User,
  Client,
  Project,
  Task,
  Approval,
  Deliverable,
  Message,
  Notification,
  Activity,
  TimeTracking,
  CalendarEvent,
  Sprint,
  AuditLog,
  TaskChecklist,
  StageTransition,
  Prototype,
  Wireframe,
  Mockup,
  CodeFile,
  Deployment,
  Bug,
  BugComment,
  UAT,
  TestCase,
  TestResult,
  Blocker,
  Feedback
};

// Run associations for each model
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

// Export all models
module.exports = {
  sequelize,
  ...models
};
