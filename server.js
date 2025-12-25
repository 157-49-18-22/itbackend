const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB } = require('./config/database');

const app = express();

// Trust proxy (required for Render/Heroku deployment)
app.set('trust proxy', 1);

// DEBUG: Log all requests
app.use((req, res, next) => {
  console.log(`👉 Request: ${req.method} ${req.url}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.status(200).send('IT Agency PMS Backend is Running! 🚀');
});

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const approvalRoutes = require('./routes/approval.routes');
const deliverableRoutes = require('./routes/deliverable.routes');
const messageRoutes = require('./routes/message.routes');
const notificationRoutes = require('./routes/notification.routes');
const activityRoutes = require('./routes/activity.routes');
const teamRoutes = require('./routes/team.routes');
const clientRoutes = require('./routes/client.routes');
const reportRoutes = require('./routes/report.routes');
const calendarRoutes = require('./routes/calendar.routes');
const timeTrackingRoutes = require('./routes/timeTracking.routes');
const workflowStateRoutes = require('./routes/sql/workflowState.routes');
// NEW Routes
const uploadRoutes = require('./routes/upload.routes');
const wireframeRoutes = require('./routes/wireframe.routes');
const sprintRoutes = require('./routes/sprint.routes');
const auditLogRoutes = require('./routes/auditLog.routes');
const mockupRoutes = require('./routes/mockup.routes');
const prototypeRoutes = require('./routes/prototype.routes');
const codeRoutes = require('./routes/code.routes');
const bugRoutes = require('./routes/bug.routes');
const uatRoutes = require('./routes/uat.routes');
const stageTransitionRoutes = require('./routes/stageTransition.routes');
const deploymentRoutes = require('./routes/deployment.routes');
const testCaseRoutes = require('./routes/testCase.routes');
const uiuxRoutes = require('./routes/uiux.routes');
const blockerRoutes = require('./routes/blocker.routes');
const feedbackRoutes = require('./routes/feedback.routes');

// ENHANCED Routes (New Features)
const projectStagesRoutes = require('./routes/projectStages.routes');
const stageTransitionsRoutes = require('./routes/stageTransitions.routes');
const commentsRoutes = require('./routes/comments.routes');
const taskChecklistsRoutes = require('./routes/taskChecklists.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const notificationsEnhancedRoutes = require('./routes/notifications.routes');
const approvalsEnhancedRoutes = require('./routes/approvals.routes');

// Middleware
app.use(helmet()); // Security headers@stage
app.use(compression()); // Compress responses
// Enhanced CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://localhost:5000',
      'https://it-agency-gold.vercel.app'
    ];

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `CORS policy does not allow access from ${origin}`;
      return callback(new Error(msg), false);
    }

    return callback(null, true);
  },
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'X-Access-Token',
    'X-Refresh-Token'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Handle preflight requests
app.options('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev')); // Logging

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Static files (for uploads)
app.use('/uploads', express.static('uploads'));

// Health check route
app.get('/health', (req, res) => {
  console.log('✅ Health check hit!');
  res.status(200).json({
    status: 'OK',
    message: 'IT Agency PMS API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// SQL Database Connection
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workflow', workflowStateRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/deliverables', deliverableRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/time-tracking', timeTrackingRoutes);
// NEW API Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/wireframes', wireframeRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/mockups', mockupRoutes);
app.use('/api/prototypes', prototypeRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/bugs', bugRoutes);
app.use('/api/uat', uatRoutes);
app.use('/api/stage-transitions', stageTransitionRoutes);
app.use('/api/deployments', deploymentRoutes);
app.use('/api/test-cases', testCaseRoutes);
app.use('/api/uiux', uiuxRoutes);
app.use('/api/blockers', blockerRoutes);
app.use('/api/feedbacks', feedbackRoutes);

// ENHANCED API Routes (New Features)
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/projects/:projectId/stages', projectStagesRoutes);
app.use('/api/projects/:projectId/stage-transitions', stageTransitionsRoutes);
app.use('/api/tasks/:taskId/checklist', taskChecklistsRoutes);
// Override old routes with enhanced versions
app.use('/api/notifications-enhanced', notificationsEnhancedRoutes);
app.use('/api/approvals-enhanced', approvalsEnhancedRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Socket.IO setup for real-time features
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Join user to their room
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Join project room
  socket.on('join_project', (projectId) => {
    socket.join(`project_${projectId}`);
    console.log(`User joined project room: ${projectId}`);
  });

  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    const { sequelize } = require('./config/database.sql');
    await sequelize.close();
    console.log('Database connection closed');
    process.exit(0);
  });
});

module.exports = app;


