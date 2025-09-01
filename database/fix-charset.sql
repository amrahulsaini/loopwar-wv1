-- ================================
-- DATABASE CHARSET FIX FOR EMOJIS
-- ================================

-- Fix database charset
ALTER DATABASE loop_wv1 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix all tables to support utf8mb4 (for emojis)
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_sessions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_activities CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE notifications CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE settings CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE cookie_consents CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix specific columns that contain text (for emoji support)
ALTER TABLE notifications MODIFY COLUMN title VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE notifications MODIFY COLUMN message TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Check current charset
SELECT 
    table_name, 
    table_collation 
FROM information_schema.tables 
WHERE table_schema = 'loop_wv1';

-- Verify the changes
SHOW FULL COLUMNS FROM notifications;
