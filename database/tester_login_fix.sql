-- ============================================
-- TESTER LOGIN FIX - SQL QUERIES
-- ============================================
-- Database: it_agency_pms
-- Run these queries in MySQL
-- ============================================

USE it_agency_pms;

-- ============================================
-- STEP 1: Check if tester user exists
-- ============================================
SELECT id, name, email, role, password 
FROM users 
WHERE role = 'tester';

-- If no results, tester doesn't exist!

-- ============================================
-- STEP 2: Create tester user (if not exists)
-- ============================================
INSERT INTO users (name, email, password, role, status, department, designation, joinDate)
VALUES 
('Test User', 'tester@gmail.com', '123123', 'tester', 'active', 'Quality Assurance', 'QA Tester', CURDATE())
ON DUPLICATE KEY UPDATE email=email;

-- ============================================
-- STEP 3: Verify tester was created
-- ============================================
SELECT id, name, email, role, password, status 
FROM users 
WHERE email = 'tester@gmail.com';

-- Expected output:
-- id | name      | email              | role   | password | status
-- XX | Test User | tester@gmail.com   | tester | 123123   | active

-- ============================================
-- STEP 4: Check all users by role
-- ============================================
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;

-- Should show:
-- role      | count
-- developer | X
-- designer  | X
-- tester    | 1  ← Should have at least 1

-- ============================================
-- STEP 5: If password is hashed, update it
-- ============================================
-- If your backend uses bcrypt, you might need to update password
-- For now, using plain text '123123' for testing

UPDATE users 
SET password = '123123' 
WHERE email = 'tester@gmail.com';

-- ============================================
-- STEP 6: Ensure user is active
-- ============================================
UPDATE users 
SET status = 'active' 
WHERE email = 'tester@gmail.com';

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to confirm everything is correct:
SELECT 
    id,
    name,
    email,
    role,
    password,
    status,
    department,
    designation
FROM users 
WHERE email = 'tester@gmail.com';

-- ============================================
-- DONE!
-- After running these queries, try logging in with:
-- Email: tester@gmail.com
-- Password: 123123
-- ============================================
