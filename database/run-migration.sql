-- Run this script to apply the database migration for adding user_id to code_problems
-- You can run this either in MySQL command line or phpMyAdmin

-- First, let's check if the user_id column already exists
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'code_problems' 
  AND TABLE_SCHEMA = DATABASE() 
  AND COLUMN_NAME = 'user_id';

-- Add user_id column if it doesn't exist (this will not error if column already exists)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_NAME = 'code_problems' 
       AND TABLE_SCHEMA = DATABASE() 
       AND COLUMN_NAME = 'user_id') = 0,
    "ALTER TABLE code_problems ADD COLUMN user_id INT DEFAULT NULL AFTER is_ai_generated",
    "SELECT 'user_id column already exists' as status"
));

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key constraint (this will not error if constraint already exists)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE TABLE_NAME = 'code_problems' 
       AND TABLE_SCHEMA = DATABASE() 
       AND CONSTRAINT_NAME = 'fk_code_problems_user_id') = 0,
    "ALTER TABLE code_problems ADD CONSTRAINT fk_code_problems_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL",
    "SELECT 'Foreign key constraint already exists' as status"
));

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add indexes for better performance (these will not error if indexes already exist)
CREATE INDEX IF NOT EXISTS idx_user_problems ON code_problems(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_location_user ON code_problems(category, topic, subtopic, sort_order, user_id);

-- Verify the migration was successful
SELECT 
    'Migration completed successfully' as status,
    COUNT(*) as total_problems,
    COUNT(user_id) as problems_with_user,
    COUNT(*) - COUNT(user_id) as system_problems
FROM code_problems;

-- Show the updated table structure
DESCRIBE code_problems;