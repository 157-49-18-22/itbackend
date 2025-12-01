# Render Deployment Guide - IT Agency PMS Backend

यह guide आपको बताएगी कि कैसे इस backend को Render पर deploy करें।

## Quick Start 🚀

### Method 1: Render Blueprint (Recommended - सबसे आसान)

1. अपनी GitHub repository में code push करें
2. Render Dashboard पर जाएं: https://dashboard.render.com
3. "Blueprints" → "New Blueprint Instance"
4. Repository connect करें
5. `render.yaml` file automatically detect होगी
6. Environment variables set करें (नीचे देखें)
7. "Apply" click करें

### Method 2: Manual Setup

पूरी step-by-step guide के लिए देखें: `.agent/workflows/deploy-backend-render.md`

## Environment Variables की Setup

Render dashboard में जाकर ये environment variables जरूर add करें:

```env
# Production में use करें
NODE_ENV=production

# Database - Render के PostgreSQL से automatically मिलेगा
DATABASE_URL=<render-postgres-internal-url>

# या manually set करें:
DB_DIALECT=postgres
DB_HOST=<from-render-postgresql-dashboard>
DB_PORT=5432
DB_NAME=it_agency_pms
DB_USER=<from-render-postgresql-dashboard>
DB_PASSWORD=<from-render-postgresql-dashboard>

# JWT Secrets - Strong random strings use करें!
JWT_SECRET=<strong-random-string-64-chars>
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=<another-strong-random-string-64-chars>
JWT_REFRESH_EXPIRE=30d

# File Uploads
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Frontend URL (deployment के बाद update करें)
CLIENT_URL=https://your-frontend-url.com
```

## Database Migration

Deployment के बाद database tables create करने के लिए:

### Option 1: Render Shell से
1. Render Dashboard → Your Service → "Shell" tab
2. Run करें:
```bash
npm run migrate
npm run seed
```

### Option 2: Local से (अगर DATABASE_URL है)
```bash
# .env में Render का DATABASE_URL add करें
npm run migrate
npm run seed
```

## Important Notes ⚠️

### 1. Database Choice
- **MySQL से PostgreSQL में switch करना जरूरी है** Render के लिए
- Render free tier में PostgreSQL ही available है
- आपकी code already both support करती है!

### 2. File Uploads Issue
Render पर uploaded files ephemeral हैं (restart पर delete):
- **Recommendation**: Cloud storage use करें (AWS S3, Cloudinary)
- Or accept करें कि files temporary हैं

### 3. Free Plan Limitations
- 15 minutes inactivity → service sleeps
- Cold start में 30-50 seconds lag
- Monthly 750 hours free

### 4. CORS Configuration
`server.js` में CLIENT_URL को production URL से update करें:
```javascript
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://your-frontend.netlify.app', // या Vercel/Render
];
```

## Testing Deployment

Deployment successful होने के बाद browser में check करें:

```
https://your-app-name.onrender.com/health
```

Expected Response:
```json
{
  "status": "OK",
  "message": "IT Agency PMS API is running",
  "timestamp": "2024-11-30T...",
  "database": "Connected",
  "dbType": "postgres"
}
```

## API Endpoints

आपकी backend URL होगी:
```
https://it-agency-pms-backend.onrender.com
```

Test API endpoints:
```
GET  /health                    - Health check
POST /api/auth/login           - Login
GET  /api/projects             - Get projects (requires auth)
GET  /api/users                - Get users (requires auth)
```

## Auto-Deploy Setup

हर git push पर automatically deploy के लिए:

1. Render Dashboard → Service Settings
2. "Build & Deploy" section
3. Enable "Auto-Deploy"
4. Branch: `main` (या आपकी default branch)

अब हर बार `git push` करने पर automatically deploy होगा! 🎉

## Troubleshooting 🔧

### Build Failed
**Check:**
- `package.json` में सभी dependencies हैं?
- `Build Command` = `npm install`
- `Start Command` = `npm start`
- Root Directory = `Backend`

### Database Connection Error
**Check:**
- DATABASE_URL सही है?
- Database Internal URL use कर रहे हैं (External नहीं)
- Database region same है service के साथ

### Port Already in Use
**Fix:** Render automatically PORT assign करता है
```javascript
const PORT = process.env.PORT || 5000; // ✅ Correct
```

### CORS Error
**Fix:** CLIENT_URL environment variable में frontend URL add करें:
```env
CLIENT_URL=https://your-frontend.netlify.app
```

## Monitoring & Logs

### Real-time Logs देखें:
1. Render Dashboard → Your Service
2. "Logs" tab

### Metrics:
1. "Metrics" tab में:
   - Request count
   - Response times
   - Error rates
   - Memory usage

## Production Checklist ✅

Deploy करने से पहले:

- [ ] `.env.example` में सभी variables documented हैं
- [ ] Strong JWT secrets use किए production में
- [ ] DATABASE_URL properly set है
- [ ] CORS में production frontend URL add है
- [ ] File upload strategy decide किया (cloud storage?)
- [ ] Database migrations ready हैं
- [ ] Health check endpoint काम कर रहा है
- [ ] Git repository updated है

## Support

अगर कोई issue आए:
1. Render Logs देखें
2. Database connection test करें
3. Environment variables verify करें
4. `.agent/workflows/deploy-backend-render.md` में detailed guide देखें

---

**Happy Deploying! 🚀**
