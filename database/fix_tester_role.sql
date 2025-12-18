-- ============================================
-- FIX: Update role to lowercase
-- ============================================

USE it_agency_pms;

-- Update role to lowercase 'tester'
UPDATE users 
SET role = 'tester' 
WHERE email = 'tester@gmail.com';

-- Verify the fix
SELECT id, name, email, role, password, status 
FROM users 
WHERE email = 'tester@gmail.com';

-- Should now show:
-- role: tester (lowercase)
