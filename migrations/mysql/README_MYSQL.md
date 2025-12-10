# MySQL Migrations - Complete Guide

## 📁 **MySQL Migration Files**

All MySQL-compatible migrations are in: `Backend/migrations/mysql/`

### **Run in Order:**

1. ✅ `01_update_existing_tables_mysql.sql`
2. ✅ `02_create_project_stages_mysql.sql`
3. ✅ `03_create_comments_table_mysql.sql`
4. ✅ `04_create_audit_trail_mysql.sql`
5. ✅ `05_create_enhanced_approvals_mysql.sql`
6. ✅ `06_create_enhanced_notifications_mysql.sql`
7. ✅ `07_create_stage_transitions_mysql.sql`
8. ✅ `08_create_task_checklists_mysql.sql`
9. ✅ `09_create_additional_tables_mysql.sql`
10. ✅ `10_create_initial_project_stages_mysql.sql`

---

## 🚀 **How to Run (Local MySQL)**

### **Option 1: MySQL Command Line**
```bash
mysql -u root -p your_database_name < Backend/migrations/mysql/01_update_existing_tables_mysql.sql
mysql -u root -p your_database_name < Backend/migrations/mysql/02_create_project_stages_mysql.sql
# ... continue for all files
```

### **Option 2: MySQL Workbench / phpMyAdmin**
1. Open file in editor
2. Copy all content
3. Paste in SQL tab
4. Execute
5. Check success message

---

## 📊 **Key Differences: MySQL vs PostgreSQL**

| Feature | PostgreSQL | MySQL |
|---------|-----------|-------|
| Column Names | `"columnName"` | `columnName` or `` `columnName` `` |
| Auto Increment | `SERIAL` | `AUTO_INCREMENT` |
| Boolean | `BOOLEAN` | `BOOLEAN` or `TINYINT(1)` |
| JSON | `JSONB` | `JSON` |
| Functions | `FUNCTION ... LANGUAGE plpgsql` | `DELIMITER // ... END //` |
| Triggers | `CREATE TRIGGER ... EXECUTE FUNCTION` | `CREATE TRIGGER ... FOR EACH ROW BEGIN ... END` |
| Check Constraints | Full support | Limited (MySQL 8.0.16+) |

---

## ✅ **Verification Queries**

After each migration:

```sql
-- Check table exists
SHOW TABLES LIKE 'table_name';

-- Check table structure
DESCRIBE table_name;

-- Check indexes
SHOW INDEX FROM table_name;

-- Check foreign keys
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'your_database_name'
AND REFERENCED_TABLE_NAME IS NOT NULL;
```

---

## 🎯 **For Supabase (PostgreSQL)**

Use the original migrations in `Backend/migrations/` folder:
- `01_update_existing_tables.sql`
- `02_create_project_stages.sql`
- etc.

These are PostgreSQL compatible and will work directly in Supabase SQL Editor.

---

## 📝 **Notes:**

1. **MySQL Version:** Requires MySQL 5.7+ or MySQL 8.0+ for full features
2. **Storage Engine:** All tables use InnoDB for foreign key support
3. **Character Set:** UTF8MB4 for emoji and international character support
4. **Stored Procedures:** Used in Migration 10 for auto-creating stages

---

## 🐛 **Common Issues:**

### **Issue: Foreign key constraint fails**
```sql
-- Check if referenced table exists
SHOW TABLES;

-- Check if referenced column exists
DESCRIBE referenced_table;
```

### **Issue: Check constraint not working**
- Requires MySQL 8.0.16+
- For older versions, use triggers instead

### **Issue: JSON column error**
- Requires MySQL 5.7.8+
- For older versions, use TEXT column

---

## ✅ **Success Criteria:**

After all migrations:
```sql
-- Should show ~30 tables
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'your_database_name';

-- Check project_stages created
SELECT COUNT(*) FROM project_stages;

-- Verify all tables
SHOW TABLES;
```

---

**Ready to run! 🚀**
