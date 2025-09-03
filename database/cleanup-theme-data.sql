-- =============================================
-- Theme System Cleanup SQL Queries
-- =============================================
-- Execute these queries to remove theme-related data from the database
-- Run these after removing the theme system from the frontend

-- 1. Remove theme preference column from users table (if it exists)
-- Check if the column exists first
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'users' 
  AND COLUMN_NAME IN ('theme_preference', 'theme', 'dark_mode', 'preferred_theme');

-- If any theme columns exist, remove them:
-- ALTER TABLE users DROP COLUMN theme_preference;
-- ALTER TABLE users DROP COLUMN theme;
-- ALTER TABLE users DROP COLUMN dark_mode;
-- ALTER TABLE users DROP COLUMN preferred_theme;

-- 2. Remove theme-related user settings/preferences (if stored separately)
-- DELETE FROM user_settings WHERE setting_key LIKE '%theme%';
-- DELETE FROM user_preferences WHERE preference_name LIKE '%theme%';

-- 3. Remove any theme-related configuration data
-- DELETE FROM app_settings WHERE setting_name LIKE '%theme%';
-- DELETE FROM configurations WHERE config_key LIKE '%theme%';

-- 4. Clean up any theme-related logs or analytics data
-- DELETE FROM user_activity_logs WHERE action_type = 'theme_change';
-- DELETE FROM analytics_events WHERE event_type = 'theme_toggle';

-- 5. Remove theme-related cookies/sessions data (if stored in database)
-- DELETE FROM user_sessions WHERE session_data LIKE '%theme%';
-- DELETE FROM cookies WHERE cookie_name LIKE '%theme%';

-- =============================================
-- Post-cleanup verification queries
-- =============================================

-- Verify no theme columns remain in users table
DESCRIBE users;

-- Check for any remaining theme-related data
-- SELECT * FROM user_settings WHERE setting_key LIKE '%theme%';
-- SELECT * FROM user_preferences WHERE preference_name LIKE '%theme%';
-- SELECT * FROM app_settings WHERE setting_name LIKE '%theme%';

-- =============================================
-- Notes:
-- =============================================
-- 1. Uncomment the queries above based on your actual database schema
-- 2. Always backup your database before running cleanup queries
-- 3. Test these queries on a development environment first
-- 4. Some columns/tables might not exist in your current schema
-- 5. Modify table and column names to match your actual database structure
