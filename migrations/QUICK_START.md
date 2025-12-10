# 🚀 Quick Start Guide - Database Migration

## ✅ Pre-Flight Checklist

```sql
-- 1. Check current database connection
SELECT current_database(), current_user;

-- 2. Backup your database (CRITICAL!)
-- In Supabase: Settings > Database > Backups
-- Or use pg_dump if using PostgreSQL directly

-- 3. Check current table count
SELECT COUNT(*) as current_tables 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
```

## 🎯 Option 1: Run All at Once (Recommended for New Setup)

### Supabase SQL Editor:
1. Open **SQL Editor** in Supabase Dashboard
2. Copy entire content from `MASTER_MIGRATION.sql`
3. Paste and click **Run**
4. Wait for completion (should take 10-30 seconds)
5. Verify success messages

### Expected Output:
```
Migration 01 completed!
Migration 02 completed!
...
Migration 11 completed!
🎉 ALL MIGRATIONS COMPLETED SUCCESSFULLY! 🎉
```

## 🔧 Option 2: Run Step by Step (Recommended for Existing Data)

Run each file in order:

```bash
# 1. Update existing tables
01_update_existing_tables.sql

# 2. Create project stages
02_create_project_stages.sql

# 3. Create comments system
03_create_comments_table.sql

# 4. Create audit trail
04_create_audit_trail.sql

# 5. Enhanced approvals
05_create_enhanced_approvals.sql

# 6. Enhanced notifications
06_create_enhanced_notifications.sql

# 7. Stage transitions
07_create_stage_transitions.sql

# 8. Task checklists
08_create_task_checklists.sql

# 9. Additional tables
09_create_additional_tables.sql

# 10. Initialize stages
10_create_initial_project_stages.sql

# 11. Views & functions
11_create_views_and_functions.sql
```

## ✨ Post-Migration Verification

### Quick Check:
```sql
-- Should return ~30+ tables
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Should return 4 views
SELECT COUNT(*) FROM pg_views WHERE schemaname = 'public';

-- Check project stages created (should be 3 × number of projects)
SELECT COUNT(*) FROM project_stages;

-- View all new tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

### Detailed Verification:
```sql
-- Check new tables exist
SELECT 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_stages') 
        THEN '✅' ELSE '❌' END as project_stages,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') 
        THEN '✅' ELSE '❌' END as comments,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_trail') 
        THEN '✅' ELSE '❌' END as audit_trail,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'approvals') 
        THEN '✅' ELSE '❌' END as approvals,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') 
        THEN '✅' ELSE '❌' END as notifications,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stage_transitions') 
        THEN '✅' ELSE '❌' END as stage_transitions,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'task_checklists') 
        THEN '✅' ELSE '❌' END as task_checklists,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') 
        THEN '✅' ELSE '❌' END as messages,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calendar_events') 
        THEN '✅' ELSE '❌' END as calendar_events,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflow_states') 
        THEN '✅' ELSE '❌' END as workflow_states,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'file_attachments') 
        THEN '✅' ELSE '❌' END as file_attachments;
```

## 🧪 Test Queries

### 1. Test Project Stages
```sql
-- View all project stages
SELECT 
    p.name as project_name,
    ps."stageNumber",
    ps."stageName",
    ps.status,
    ps."progressPercentage"
FROM project_stages ps
JOIN projects p ON ps."projectId" = p.id
ORDER BY p.id, ps."stageNumber";
```

### 2. Test Dashboard View
```sql
-- View dashboard summary
SELECT * FROM project_dashboard_summary LIMIT 5;
```

### 3. Test Helper Functions
```sql
-- Get project progress
SELECT get_project_progress(1) as progress_percentage;

-- Get overdue tasks
SELECT get_overdue_tasks_count() as total_overdue;

-- Get team availability
SELECT * FROM get_team_availability();
```

### 4. Test Notification System
```sql
-- Send a test notification
SELECT send_notification(
    1,  -- user_id
    'Test Notification',
    'This is a test message',
    'info',
    NULL,
    NULL,
    '/dashboard',
    'normal',
    FALSE
);

-- View notifications
SELECT * FROM notifications ORDER BY "createdAt" DESC LIMIT 5;
```

### 5. Test Stage Transition
```sql
-- Transition a project stage (example)
-- SELECT transition_project_stage(1, 'Development', 1, 'UI/UX phase completed', 'Moving to development');
```

## 🐛 Common Issues & Solutions

### Issue 1: "relation already exists"
```sql
-- Solution: Table already exists, safe to skip or drop first
DROP TABLE IF EXISTS table_name CASCADE;
-- Then re-run migration
```

### Issue 2: "column already exists"
```sql
-- Solution: Column already added, safe to skip
-- Migrations use "ADD COLUMN IF NOT EXISTS" so this shouldn't happen
```

### Issue 3: "foreign key constraint violation"
```sql
-- Solution: Run migrations in order
-- Check which migration failed and ensure previous ones completed
```

### Issue 4: "permission denied"
```sql
-- Solution: Need admin access
-- Contact database administrator or use superuser account
```

## 📊 Database Schema Summary

After migration, you'll have:

### Core Tables (15 existing):
- users
- projects
- tasks
- time_tracking
- sprints
- wireframes
- mockups
- prototypes
- code_files
- bugs
- test_cases
- uat
- deployments
- deliverables
- clients

### New Tables (11 added):
- ✨ project_stages
- ✨ comments
- ✨ audit_trail
- ✨ approvals (enhanced)
- ✨ notifications (enhanced)
- ✨ stage_transitions
- ✨ task_checklists
- ✨ messages
- ✨ calendar_events
- ✨ workflow_states
- ✨ file_attachments

### Views (4):
- 📊 project_dashboard_summary
- 📊 user_workload_summary
- 📊 pending_approvals_summary
- 📊 bug_statistics

### Functions (7+):
- 🔧 create_default_project_stages
- 🔧 auto_create_project_stages
- 🔧 transition_project_stage
- 🔧 send_notification
- 🔧 calculate_task_completion
- 🔧 get_project_progress
- 🔧 get_overdue_tasks_count
- 🔧 get_team_availability
- 🔧 log_audit_trail

## 🎯 Next Steps After Migration

1. **Update Backend API**
   - Add controllers for new tables
   - Update existing controllers
   - Add new API endpoints

2. **Update Frontend Components**
   - Enhance Dashboard with new metrics
   - Add Stage Management UI
   - Implement Approval Workflow UI
   - Add Notification System UI

3. **Test Everything**
   - Test stage transitions
   - Test approval workflows
   - Test notification system
   - Test all CRUD operations

4. **Deploy Changes**
   - Update production database
   - Deploy backend changes
   - Deploy frontend changes
   - Monitor for issues

## 📞 Support

If you need help:
1. Check `README.md` in migrations folder
2. Review individual migration files
3. Check Supabase logs for errors
4. Verify all prerequisites are met

---

**Happy Migrating! 🚀**
