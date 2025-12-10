# Database Migration Guide

## Overview
This directory contains SQL migration files to update your IT Agency Project Management System database to match the comprehensive documentation requirements.

## Migration Files

### **IMPORTANT: Run migrations in order!**

| Order | File | Description | Status |
|-------|------|-------------|--------|
| 1 | `01_update_existing_tables.sql` | Add missing columns to existing tables | ⚠️ Required |
| 2 | `02_create_project_stages.sql` | Create project_stages table for 3-stage workflow | ⚠️ Required |
| 3 | `03_create_comments_table.sql` | Create comments table for discussions | ⚠️ Required |
| 4 | `04_create_audit_trail.sql` | Create audit_trail table for activity logging | ⚠️ Required |
| 5 | `05_create_enhanced_approvals.sql` | Create/update approvals table | ⚠️ Required |
| 6 | `06_create_enhanced_notifications.sql` | Create/update notifications table | ⚠️ Required |
| 7 | `07_create_stage_transitions.sql` | Create stage_transitions table | ⚠️ Required |
| 8 | `08_create_task_checklists.sql` | Create task_checklists table | ⚠️ Required |
| 9 | `09_create_additional_tables.sql` | Create messages, calendar_events, etc. | ⚠️ Required |
| 10 | `10_create_initial_project_stages.sql` | Auto-create stages for existing projects | ⚠️ Required |
| 11 | `11_create_views_and_functions.sql` | Create helper views and functions | 📊 Optional |

## How to Run Migrations

### Option 1: Supabase SQL Editor (Recommended)

1. **Login to Supabase Dashboard**
   - Go to https://supabase.com
   - Login to your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run Each Migration**
   - Copy the content of migration file (starting from `01_update_existing_tables.sql`)
   - Paste into SQL Editor
   - Click "Run" button
   - Wait for success message
   - Repeat for next migration file

4. **Verify Success**
   - Each migration should show a success message
   - Check the "Table Editor" to verify new tables/columns

### Option 2: PostgreSQL Command Line

```bash
# Connect to your database
psql -h your-host -U your-user -d your-database

# Run each migration
\i Backend/migrations/01_update_existing_tables.sql
\i Backend/migrations/02_create_project_stages.sql
\i Backend/migrations/03_create_comments_table.sql
# ... continue with remaining files
```

### Option 3: Using Database Client (DBeaver, pgAdmin, etc.)

1. Connect to your database
2. Open SQL console/query tool
3. Copy-paste each migration file content
4. Execute in order
5. Verify success messages

## Pre-Migration Checklist

- [ ] **Backup your database** (CRITICAL!)
- [ ] Verify you have admin/superuser access
- [ ] Check current database schema
- [ ] Note current table count (should be ~15)
- [ ] Close all active connections to database
- [ ] Inform team about maintenance window

## Post-Migration Verification

After running all migrations, verify:

### 1. Check Table Count
```sql
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';
-- Should return ~30+ tables
```

### 2. Check New Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Expected new tables:
- ✅ project_stages
- ✅ comments
- ✅ audit_trail
- ✅ approvals (updated)
- ✅ notifications (updated)
- ✅ stage_transitions
- ✅ task_checklists
- ✅ messages
- ✅ calendar_events
- ✅ workflow_states
- ✅ file_attachments

### 3. Check Project Stages Created
```sql
SELECT COUNT(*) as stages_count FROM project_stages;
-- Should return 3 * number_of_projects
```

### 4. Check Views Created
```sql
SELECT viewname FROM pg_views WHERE schemaname = 'public';
```

Expected views:
- ✅ project_dashboard_summary
- ✅ user_workload_summary
- ✅ pending_approvals_summary
- ✅ bug_statistics

### 5. Check Functions Created
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION';
```

Expected functions:
- ✅ create_default_project_stages
- ✅ transition_project_stage
- ✅ send_notification
- ✅ calculate_task_completion
- ✅ get_project_progress
- ✅ get_overdue_tasks_count
- ✅ get_team_availability

## Rollback Instructions

If you need to rollback migrations:

### Rollback Migration 11 (Views & Functions)
```sql
DROP VIEW IF EXISTS project_dashboard_summary CASCADE;
DROP VIEW IF EXISTS user_workload_summary CASCADE;
DROP VIEW IF EXISTS pending_approvals_summary CASCADE;
DROP VIEW IF EXISTS bug_statistics CASCADE;
DROP FUNCTION IF EXISTS get_project_progress CASCADE;
DROP FUNCTION IF EXISTS get_overdue_tasks_count CASCADE;
DROP FUNCTION IF EXISTS get_team_availability CASCADE;
```

### Rollback Migration 10 (Initial Stages)
```sql
DROP TRIGGER IF EXISTS trigger_auto_create_project_stages ON projects;
DROP FUNCTION IF EXISTS auto_create_project_stages CASCADE;
DROP FUNCTION IF EXISTS create_default_project_stages CASCADE;
DELETE FROM project_stages;
```

### Rollback Migration 09 (Additional Tables)
```sql
DROP TABLE IF EXISTS file_attachments CASCADE;
DROP TABLE IF EXISTS workflow_states CASCADE;
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
```

### Rollback Migration 08 (Task Checklists)
```sql
DROP TABLE IF EXISTS task_checklists CASCADE;
DROP FUNCTION IF EXISTS calculate_task_completion CASCADE;
```

### Rollback Migration 07 (Stage Transitions)
```sql
DROP TABLE IF EXISTS stage_transitions CASCADE;
DROP FUNCTION IF EXISTS transition_project_stage CASCADE;
```

### Rollback Migration 06 (Notifications)
```sql
DROP TABLE IF EXISTS notifications CASCADE;
DROP FUNCTION IF EXISTS send_notification CASCADE;
```

### Rollback Migration 05 (Approvals)
```sql
DROP TABLE IF EXISTS approvals CASCADE;
```

### Rollback Migration 04 (Audit Trail)
```sql
DROP TABLE IF EXISTS audit_trail CASCADE;
DROP FUNCTION IF EXISTS log_audit_trail CASCADE;
```

### Rollback Migration 03 (Comments)
```sql
DROP TABLE IF EXISTS comments CASCADE;
```

### Rollback Migration 02 (Project Stages)
```sql
DROP TABLE IF EXISTS project_stages CASCADE;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_stageid_fkey;
```

### Rollback Migration 01 (Column Updates)
```sql
-- Remove added columns (be careful with this!)
ALTER TABLE projects DROP COLUMN IF EXISTS "currentStage";
ALTER TABLE projects DROP COLUMN IF EXISTS "actualEndDate";
ALTER TABLE projects DROP COLUMN IF EXISTS "projectType";
ALTER TABLE projects DROP COLUMN IF EXISTS "category";
-- ... continue for other columns
```

## Troubleshooting

### Error: "relation already exists"
**Solution:** The table/view already exists. You can either:
- Skip this migration
- Drop the existing table/view first (⚠️ will lose data!)
- Use `CREATE TABLE IF NOT EXISTS` (already in scripts)

### Error: "column already exists"
**Solution:** The column was already added. Safe to ignore or use:
```sql
ALTER TABLE table_name ADD COLUMN IF NOT EXISTS column_name TYPE;
```

### Error: "permission denied"
**Solution:** You need superuser/admin access:
```sql
-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE your_db TO your_user;
```

### Error: "foreign key constraint violation"
**Solution:** Ensure migrations are run in order. Some tables depend on others.

## Support

If you encounter issues:

1. **Check Migration Order:** Ensure you're running migrations in sequence
2. **Check Database Logs:** Look for detailed error messages
3. **Verify Permissions:** Ensure you have admin access
4. **Restore Backup:** If critical errors occur, restore from backup
5. **Contact Support:** Provide error message and migration number

## Database Schema Summary

After all migrations, your database will have:

- **Core Tables:** 15 (existing)
- **New Tables:** 15+ (added)
- **Total Tables:** ~30+
- **Views:** 4
- **Functions:** 7+
- **Triggers:** 10+
- **Indexes:** 50+

## Next Steps

After successful migration:

1. ✅ Update backend API controllers
2. ✅ Update frontend components
3. ✅ Test all workflows
4. ✅ Update documentation
5. ✅ Train team on new features

---

**Last Updated:** December 10, 2025  
**Version:** 1.0  
**Compatibility:** PostgreSQL 12+, Supabase
