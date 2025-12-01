# SQL Database Setup Guide

## 🗄️ Database Choice

Aapka backend **MySQL** ya **PostgreSQL** dono ke saath kaam karega. Choose karo jo aapko pasand ho.

---

## Option 1: MySQL Setup (Recommended for Beginners)

### Step 1: Install MySQL

**Windows:**
1. Download: https://dev.mysql.com/downloads/installer/
2. Install MySQL Server + MySQL Workbench
3. Setup root password during installation

**Mac:**
```bash
brew install mysql
brew services start mysql
```

**Linux:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

### Step 2: Create Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE it_agency_pms;

# Create user (optional, for security)
CREATE USER 'pms_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON it_agency_pms.* TO 'pms_user'@'localhost';
FLUSH PRIVILEGES;

# Exit
exit;
```

### Step 3: Configure .env

```env
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=it_agency_pms
DB_USER=root
DB_PASSWORD=your_mysql_password
```

---

## Option 2: PostgreSQL Setup

### Step 1: Install PostgreSQL

**Windows:**
1. Download: https://www.postgresql.org/download/windows/
2. Install PostgreSQL + pgAdmin

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Create Database

```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE it_agency_pms;

# Create user
CREATE USER pms_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE it_agency_pms TO pms_user;

# Exit
\q
```

### Step 3: Configure .env

```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=it_agency_pms
DB_USER=postgres
DB_PASSWORD=your_postgres_password
```

---

## 🚀 Backend Setup

### Step 1: Install Dependencies

```bash
cd Backend
npm install
```

### Step 2: Create .env File

```bash
# Copy example
copy .env.example .env

# Edit .env with your database credentials
```

### Step 3: Run Migrations (Creates Tables)

```bash
npm run migrate
```

Ye command automatically saare tables create kar dega:
- users
- clients
- projects
- tasks
- approvals
- deliverables
- messages
- notifications
- activities
- time_tracking
- calendar_events

### Step 4: Seed Database (Optional)

```bash
npm run seed
```

Ye sample data add karega:
- 6 users (admin, PM, developers, designer, tester)
- 3 clients
- 3 projects
- Tasks, approvals, deliverables, messages, notifications

**Test Login:**
- Email: `admin@itagency.com`
- Password: `password123`

### Step 5: Start Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server: http://localhost:5000

---

## 🧪 Test Database Connection

```bash
# Test health endpoint
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "OK",
  "message": "IT Agency PMS API is running",
  "database": "Connected",
  "dbType": "mysql"
}
```

---

## 📊 Database Structure

### Tables Created:

1. **users** - Team members, admins, clients
2. **clients** - Client companies
3. **projects** - All projects
4. **tasks** - Project tasks
5. **approvals** - Approval requests
6. **deliverables** - Files and deliverables
7. **messages** - Internal messaging
8. **notifications** - User notifications
9. **activities** - Activity log
10. **time_tracking** - Time entries
11. **calendar_events** - Calendar events

### Relationships:

- User → Projects (as PM)
- User → Tasks (assigned)
- Client → Projects
- Project → Tasks, Deliverables, Approvals
- And more...

---

## 🔧 Common Issues

### Issue: Can't connect to MySQL

```bash
# Check if MySQL is running
# Windows: Services → MySQL
# Mac: brew services list
# Linux: sudo systemctl status mysql

# Reset root password if forgotten
# Google: "reset mysql root password"
```

### Issue: Can't connect to PostgreSQL

```bash
# Check if PostgreSQL is running
# Windows: Services → PostgreSQL
# Mac: brew services list
# Linux: sudo systemctl status postgresql

# Check pg_hba.conf for authentication settings
```

### Issue: Tables not created

```bash
# Run migration again
npm run migrate

# Or reset database
npm run db:reset
```

### Issue: Port already in use

Change port in `.env`:
```env
PORT=5001
```

---

## 🗄️ Database Tools

### MySQL Workbench
- Visual tool for MySQL
- Download: https://dev.mysql.com/downloads/workbench/
- Connect and view tables

### pgAdmin (PostgreSQL)
- Visual tool for PostgreSQL
- Download: https://www.pgadmin.org/
- Comes with PostgreSQL installer

### DBeaver (Universal)
- Works with both MySQL and PostgreSQL
- Download: https://dbeaver.io/
- Free and open source

---

## 📝 SQL Queries (For Testing)

```sql
-- View all users
SELECT * FROM users;

-- View all projects
SELECT * FROM projects;

-- View tasks with project names
SELECT t.*, p.name as project_name 
FROM tasks t 
JOIN projects p ON t.projectId = p.id;

-- Count users by role
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;
```

---

## 🔄 Database Reset

Agar aapko database reset karna ho:

```bash
npm run db:reset
```

Ye command:
1. Saare tables drop karega
2. Tables dobara create karega
3. Sample data seed karega

---

## 📦 Backup & Restore

### MySQL Backup:
```bash
mysqldump -u root -p it_agency_pms > backup.sql
```

### MySQL Restore:
```bash
mysql -u root -p it_agency_pms < backup.sql
```

### PostgreSQL Backup:
```bash
pg_dump -U postgres it_agency_pms > backup.sql
```

### PostgreSQL Restore:
```bash
psql -U postgres it_agency_pms < backup.sql
```

---

## ✅ Checklist

- [ ] MySQL/PostgreSQL installed
- [ ] Database created (`it_agency_pms`)
- [ ] `.env` file configured
- [ ] Dependencies installed (`npm install`)
- [ ] Tables created (`npm run migrate`)
- [ ] Sample data loaded (`npm run seed`)
- [ ] Server running (`npm run dev`)
- [ ] Health check passes
- [ ] Login works

---

**Aapka SQL database ready hai! 🎉**

Ab aap frontend ko backend se connect kar sakte ho.
