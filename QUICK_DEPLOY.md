# 🚀 Render Deployment - Quick Reference

## तुरंत Deploy करने के Steps (5 Minutes)

### 1️⃣ Code को Git पर Push करें
```bash
cd "c:\Users\lenovo\Desktop\New Project"
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2️⃣ Render पर Database बनाएं
1. https://dashboard.render.com पर जाएं
2. New + → PostgreSQL
3. Name: `it-agency-pms-db`
4. Create करें
5. **Internal Connection String** copy करें

### 3️⃣ Web Service बनाएं
1. New + → Web Service
2. Repository connect करें
3. Settings:
   - Name: `it-agency-pms-backend`
   - **Root Directory**: `Backend` ⚠️ (यह जरूरी है!)
   - Build: `npm install`
   - Start: `npm start`

### 4️⃣ Environment Variables
```env
NODE_ENV=production
DATABASE_URL=<step-2-se-copied-url>
JWT_SECRET=super-secret-random-string-64-characters-long-change-this
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=another-super-secret-random-string-64-chars
JWT_REFRESH_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```

### 5️⃣ Deploy!
"Create Web Service" → Wait 2-3 minutes → Done! ✅

---

## 🔗 URLs

**Your Backend URL:**
```
https://it-agency-pms-backend.onrender.com
```

**Health Check:**
```
https://it-agency-pms-backend.onrender.com/health
```

**API Base:**
```
https://it-agency-pms-backend.onrender.com/api
```

---

## 🧪 Test करें

### Browser में:
```
https://it-agency-pms-backend.onrender.com/health
```

### या Postman में:
POST `https://it-agency-pms-backend.onrender.com/api/auth/login`

---

## ⚡ Frontend में Backend Connect करें

Frontend की `.env` file में:
```env
VITE_API_URL=https://it-agency-pms-backend.onrender.com/api
```

---

## ⚠️ Important

1. **Free Tier**: 15 min inactivity → sleeps (cold start 30-50s)
2. **Files**: Upload किए files restart पर delete (use cloud storage)
3. **Database**: PostgreSQL use करें (MySQL नहीं)

---

## 🆘 Problems?

**Build Failed?**
→ Check: Root Directory = `Backend` है?

**Database Error?**
→ Use Internal URL, not External

**CORS Error?**
→ CLIENT_URL में frontend URL add करें

---

## 📚 Detailed Guide

पूरी details के लिए:
- `Backend/RENDER_DEPLOYMENT.md`
- `.agent/workflows/deploy-backend-render.md`
