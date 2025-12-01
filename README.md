# IT Agency PMS - Backend API

Complete Node.js + Express + MongoDB backend for IT Agency Project Management System.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Real-time Updates**: Socket.IO for live notifications and messages
- **RESTful API**: Clean, organized endpoints for all features
- **MongoDB (NoSQL)**: Flexible document-based database
- **Security**: Helmet, CORS, rate limiting, password hashing
- **File Uploads**: Multer for deliverables and attachments
- **Activity Logging**: Track all user actions
- **Notifications System**: Real-time push notifications

## 📁 Project Structure

```
Backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── auth.controller.js   # Authentication logic
│   └── project.controller.js # Project CRUD
├── middleware/
│   └── auth.middleware.js   # JWT verification & authorization
├── models/                   # MongoDB Schemas (NoSQL)
│   ├── User.model.js
│   ├── Project.model.js
│   ├── Task.model.js
│   ├── Approval.model.js
│   ├── Deliverable.model.js
│   ├── Message.model.js
│   ├── Notification.model.js
│   ├── Activity.model.js
│   ├── Client.model.js
│   ├── TimeTracking.model.js
│   └── CalendarEvent.model.js
├── routes/                   # API Routes
│   ├── auth.routes.js
│   ├── project.routes.js
│   ├── task.routes.js
│   ├── approval.routes.js
│   ├── deliverable.routes.js
│   ├── message.routes.js
│   ├── notification.routes.js
│   ├── activity.routes.js
│   ├── team.routes.js
│   ├── client.routes.js
│   ├── report.routes.js
│   ├── calendar.routes.js
│   └── timeTracking.routes.js
├── utils/
│   ├── jwt.utils.js         # Token generation
│   ├── notification.utils.js # Notification helpers
│   └── activity.utils.js    # Activity logging
├── uploads/                  # File storage
├── .env.example             # Environment variables template
├── package.json
├── server.js                # Entry point
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)

### Step 1: Install Dependencies
```bash
cd Backend
npm install
```

### Step 2: Environment Configuration
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your values
```

**Required Environment Variables:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/it-agency-pms
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### Step 3: Start MongoDB
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas cloud connection string in .env
```

### Step 4: Run Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login
GET    /api/auth/me                # Get current user
POST   /api/auth/logout            # Logout
POST   /api/auth/refresh-token     # Refresh JWT
PUT    /api/auth/update-password   # Change password
```

### Projects
```
GET    /api/projects               # Get all projects
POST   /api/projects               # Create project (Admin/PM)
GET    /api/projects/:id           # Get project details
PUT    /api/projects/:id           # Update project (Admin/PM)
DELETE /api/projects/:id           # Delete project (Admin)
GET    /api/projects/:id/stats     # Project statistics
```

### Tasks
```
GET    /api/tasks                  # Get all tasks
POST   /api/tasks                  # Create task
PUT    /api/tasks/:id              # Update task
DELETE /api/tasks/:id              # Delete task
```

### Approvals
```
GET    /api/approvals              # Get all approvals
POST   /api/approvals              # Create approval request
PUT    /api/approvals/:id/approve  # Approve
PUT    /api/approvals/:id/reject   # Reject
```

### Deliverables
```
GET    /api/deliverables           # Get all deliverables
POST   /api/deliverables           # Upload deliverable
PUT    /api/deliverables/:id       # Update deliverable
```

### Messages
```
GET    /api/messages               # Get messages
POST   /api/messages               # Send message
PUT    /api/messages/:id/read      # Mark as read
```

### Notifications
```
GET    /api/notifications          # Get user notifications
PUT    /api/notifications/:id/read # Mark as read
PUT    /api/notifications/mark-all-read # Mark all as read
```

### Activity
```
GET    /api/activity               # Get activity feed
```

### Team
```
GET    /api/team                   # Get team members
```

### Clients
```
GET    /api/clients                # Get all clients
POST   /api/clients                # Add client (Admin/PM)
PUT    /api/clients/:id            # Update client
```

### Reports
```
GET    /api/reports/dashboard      # Dashboard statistics
```

### Calendar
```
GET    /api/calendar               # Get events
POST   /api/calendar               # Create event
```

### Time Tracking
```
GET    /api/time-tracking          # Get time entries
POST   /api/time-tracking          # Start tracking
PUT    /api/time-tracking/:id/stop # Stop timer
```

## 🔐 Authentication

All protected routes require JWT token in header:
```
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **Admin**: Full access
- **Project Manager**: Manage projects, tasks, team
- **Developer**: Tasks, deliverables, time tracking
- **Designer**: UI/UX tasks, deliverables
- **Tester**: Testing tasks, bug reports
- **Client**: View-only access to their projects

## 📊 MongoDB Collections (NoSQL)

### Users
```javascript
{
  name, email, password (hashed), role, department,
  avatar, phone, status, skills, preferences
}
```

### Projects
```javascript
{
  name, description, client, status, priority,
  currentPhase, progress, startDate, endDate,
  team: { projectManager, members[] },
  phases: { uiux, development, testing },
  budget, tags, attachments
}
```

### Tasks
```javascript
{
  title, description, project, status, priority,
  assignee, reporter, dueDate, estimatedHours,
  tags, comments[], checklist[], dependencies[]
}
```

### Approvals
```javascript
{
  approvalId, type, title, project,
  requestedBy, requestedTo, status, priority,
  notes, attachments[], approvedAt, rejectedAt
}
```

## 🔄 Real-time Features (Socket.IO)

### Events
- `new_notification` - New notification received
- `new_message` - New message in thread
- `new_activity` - Activity feed update

### Usage
```javascript
// Client connects
socket.emit('join', userId);
socket.emit('join_project', projectId);

// Listen for events
socket.on('new_notification', (data) => {
  // Update UI
});
```

## 🧪 Testing

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

## 📦 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **socket.io**: Real-time communication
- **cors**: Cross-origin requests
- **helmet**: Security headers
- **morgan**: HTTP logging
- **multer**: File uploads
- **express-rate-limit**: Rate limiting
- **dotenv**: Environment variables

## 🚀 Deployment

### MongoDB Atlas (Cloud)
1. Create cluster at mongodb.com/cloud/atlas
2. Get connection string
3. Update MONGODB_URI in .env

### Heroku
```bash
heroku create your-app-name
heroku config:set MONGODB_URI=your-atlas-uri
heroku config:set JWT_SECRET=your-secret
git push heroku main
```

### Docker
```bash
docker build -t it-agency-backend .
docker run -p 5000:5000 --env-file .env it-agency-backend
```

## 📝 Notes

- All passwords are hashed with bcrypt
- JWT tokens expire in 7 days (configurable)
- File uploads stored in `/uploads` directory
- Activity logs auto-generated for key actions
- Notifications sent via Socket.IO in real-time
- MongoDB indexes added for performance

## 🔧 Troubleshooting

**MongoDB Connection Error:**
```bash
# Check if MongoDB is running
mongod --version

# Or use MongoDB Atlas cloud
```

**Port Already in Use:**
```bash
# Change PORT in .env file
PORT=5001
```

**CORS Issues:**
```bash
# Update CLIENT_URL in .env
CLIENT_URL=http://localhost:5173
```

## 📞 Support

For issues or questions, check the main project README or create an issue.

---

**Built with Node.js, Express, MongoDB (NoSQL), Socket.IO**
