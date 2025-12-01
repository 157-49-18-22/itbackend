# Backend Setup Guide - Step by Step

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Node.js
Download and install from: https://nodejs.org/ (v16 or higher)

### Step 2: Install MongoDB

**Option A: Local MongoDB**
- Download from: https://www.mongodb.com/try/download/community
- Install and start MongoDB service

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster (Free tier available)
4. Get connection string

### Step 3: Setup Backend

```bash
# Navigate to Backend folder
cd Backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env
# (On Mac/Linux: cp .env.example .env)
```

### Step 4: Configure .env File

Open `.env` and update:

```env
# For Local MongoDB
MONGODB_URI=mongodb://localhost:27017/it-agency-pms

# OR for MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/it-agency-pms

# Generate a random secret (or use any long random string)
JWT_SECRET=your-super-secret-key-change-this

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### Step 5: Seed Database (Optional but Recommended)

```bash
npm run seed
```

This creates:
- 6 test users (admin, PM, designers, developers, tester)
- 3 clients
- 3 projects
- Sample tasks, approvals, deliverables, messages, notifications

**Test Login:**
- Email: `admin@itagency.com`
- Password: `password123`

### Step 6: Start Server

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

Server runs on: http://localhost:5000

### Step 7: Test API

Open browser: http://localhost:5000/health

You should see:
```json
{
  "status": "OK",
  "message": "IT Agency PMS API is running",
  "database": "Connected"
}
```

## 🧪 Testing the API

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@itagency.com\",\"password\":\"password123\"}"
```

You'll get a JWT token. Copy it.

### Test Protected Route
```bash
curl http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔧 Common Issues & Solutions

### Issue: MongoDB Connection Failed

**Solution 1 - Local MongoDB:**
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service
# Windows: Start MongoDB service from Services
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

**Solution 2 - Use MongoDB Atlas:**
1. Create free cluster at mongodb.com/cloud/atlas
2. Whitelist your IP (0.0.0.0/0 for development)
3. Create database user
4. Get connection string and update .env

### Issue: Port 5000 Already in Use

Change port in `.env`:
```env
PORT=5001
```

### Issue: npm install fails

```bash
# Clear cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Issue: CORS Error from Frontend

Update `.env`:
```env
CLIENT_URL=http://localhost:5173
```

Or if frontend runs on different port, change accordingly.

## 📱 Connecting Frontend to Backend

In your React frontend, create API service:

```javascript
// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

**Usage:**
```javascript
// Login
const response = await api.post('/auth/login', {
  email: 'admin@itagency.com',
  password: 'password123'
});
localStorage.setItem('token', response.data.token);

// Get projects
const projects = await api.get('/projects');
```

## 🔐 User Roles & Permissions

| Role | Permissions |
|------|------------|
| **Admin** | Full access to everything |
| **Project Manager** | Create/edit projects, assign tasks, manage team |
| **Developer** | View projects, manage assigned tasks, track time |
| **Designer** | Upload deliverables, manage UI/UX tasks |
| **Tester** | Create bugs, run tests, update test cases |
| **Client** | View their projects (read-only) |

## 📊 Database Collections

After seeding, you'll have:

- **users** - 6 team members
- **clients** - 3 clients
- **projects** - 3 projects (1 completed, 2 in progress)
- **tasks** - Sample tasks
- **approvals** - Pending approvals
- **deliverables** - Design files
- **messages** - Project messages
- **notifications** - User notifications
- **activities** - Activity log

## 🛠️ Development Workflow

1. **Make changes** to code
2. **Server auto-reloads** (if using `npm run dev`)
3. **Test endpoints** using Postman or curl
4. **Check MongoDB** data using MongoDB Compass

## 📦 Production Deployment

### Heroku
```bash
heroku create your-app-name
heroku config:set MONGODB_URI=your-atlas-uri
heroku config:set JWT_SECRET=your-secret
heroku config:set NODE_ENV=production
git push heroku main
```

### Render.com
1. Connect GitHub repo
2. Add environment variables
3. Deploy

### Railway.app
1. Connect GitHub repo
2. Add MongoDB plugin
3. Deploy

## 🔍 Monitoring & Debugging

**View Logs:**
```bash
# Development
npm run dev
# Logs appear in terminal

# Production (if using PM2)
pm2 logs
```

**MongoDB Compass:**
- Download: https://www.mongodb.com/products/compass
- Connect to view/edit data visually

**Postman:**
- Download: https://www.postman.com/
- Import API endpoints for testing

## 📞 Need Help?

1. Check `README.md` for API documentation
2. Review error logs in terminal
3. Check MongoDB connection
4. Verify .env configuration
5. Ensure all dependencies installed

## ✅ Checklist

- [ ] Node.js installed (v16+)
- [ ] MongoDB running (local or Atlas)
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured
- [ ] Database seeded (`npm run seed`)
- [ ] Server running (`npm run dev`)
- [ ] Health check passes (http://localhost:5000/health)
- [ ] Login works (test with admin credentials)

---

**You're all set! 🎉**

Backend is ready to connect with your React frontend.
