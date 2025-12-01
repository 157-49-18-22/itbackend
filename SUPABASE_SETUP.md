# 🎯 Supabase Database Setup (FREE)

Render database paid हो गई है, तो हम **Supabase** use करेंगे - यह **completely FREE** है!

## Step 1: Supabase Account बनाएं

1. Browser में जाएं: **https://supabase.com**
2. **Start your project** → **Sign in with GitHub** (recommended)
3. Authorize करें

## Step 2: New Project बनाएं

1. Dashboard में **New Project** click करें
2. Organization select करें (default)
3. Project details भरें:

```
Project Name: itbackend
Database Password: [Strong password - save this!]
Region: Southeast Asia (Singapore) - closest to India
Pricing Plan: Free (0$/month)
```

4. **Create New Project** button click करें
5. ⏳ **2-3 minutes wait** करें (project setup हो रहा है)

## Step 3: Connection String लें

Project create होने के बाद:

1. Left sidebar → **Settings (⚙️)** → **Database**
2. Scroll down → **Connection String** section
3. **URI** tab select करें
4. Mode: **Session** (या Transaction)
5. 👁️ Click करके password visible करें
6. **Copy** button click करें

**Connection String Example:**
```
postgresql://postgres.abcdefgh:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

⚠️ **[YOUR-PASSWORD]** को अपने actual password से replace करें!

## Step 4: Render में Add करें

1. **Render Dashboard** → Your Web Service
2. **Environment** tab
3. **Add Environment Variable**:

```env
DATABASE_URL=postgresql://postgres.xxxxx:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

या separately:
```env
DB_DIALECT=postgres
DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.xxxxx
DB_PASSWORD=your-database-password
```

4. **Save Changes**
5. Service automatically **redeploy** होगी

## Step 5: Tables Create करें (Migration)

### Option A: Supabase SQL Editor से

1. Supabase Dashboard → **SQL Editor**
2. New Query
3. आपकी migrations files का SQL code paste करें
4. **Run** करें

### Option B: Render Shell से

1. Render → Your Service → **Shell** tab
2. Run करें:
```bash
npm run migrate
npm run seed
```

## Step 6: Verify करें

Browser में:
```
https://itbackend.onrender.com/health
```

Response में देखें:
```json
{
  "database": "Connected",  ✅
  "dbType": "postgres"
}
```

---

## 🎁 Free Tier Limits

Supabase Free Plan:
- ✅ **500 MB Database** storage
- ✅ **Unlimited API requests**
- ✅ **50,000 Monthly Active Users**
- ✅ **1 GB File Storage**
- ✅ **2 GB Bandwidth**
- ✅ **Social OAuth providers**
- ✅ **7-day log retention**

यह आपके project के लिए **काफी है**! 🎉

---

## 📊 Database Management

### Supabase Table Editor:
1. Dashboard → **Table Editor**
2. Visual interface से tables देख/edit सकते हैं
3. Data add/delete कर सकते हैं
4. Like phpMyAdmin

### SQL Editor:
1. Dashboard → **SQL Editor**
2. Direct SQL queries run करें
3. Migrations run करें

### Backups:
- Free plan में daily backups (7 days retention)

---

## 🆘 Troubleshooting

### Connection Error:
**Check:**
- Password correct है?
- `[YOUR-PASSWORD]` को actual password से replace किया?
- Connection pooling mode: Session या Transaction

### SSL Required Error:
Connection string में add करें:
```
?sslmode=require
```

Example:
```
postgresql://postgres.xxx:pass@host:5432/postgres?sslmode=require
```

---

## 💡 Pro Tips

1. **Password Strong रखें**: Minimum 12 characters, mixed case, numbers, symbols
2. **Connection String को .env में रखें**: Never commit to Git!
3. **Supabase Auth use करें**: Built-in authentication (optional)
4. **Real-time features**: Supabase supports real-time subscriptions!

---

**अब आप FREE में production-ready database use कर सकते हैं!** 🚀
