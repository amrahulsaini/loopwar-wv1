-- Migration to add user_id column to code_problems table
-- This ensures that existing test cases and AI-generated problems are preserved
-- and allows tracking which user created each problem

-- Add user_id column if it doesn't exist
ALTER TABLE code_problems 
ADD COLUMN IF NOT EXISTS user_id INT DEFAULT NULL AFTER is_ai_generated;

-- Add foreign key constraint to reference users table
ALTER TABLE code_problems 
ADD CONSTRAINT fk_code_problems_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_problems ON code_problems(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_location_user ON code_problems(category, topic, subtopic, sort_order, user_id);

-- Update existing AI-generated problems to have NULL user_id (system-generated)
-- This is already the default, but making it explicit
UPDATE code_problems 
SET user_id = NULL 
WHERE is_ai_generated = TRUE AND user_id IS NULL;

-- Optional: Set a specific user_id for system-generated content
-- Uncomment and modify the line below if you want to assign system problems to a specific admin user
-- UPDATE code_problems SET user_id = 1 WHERE is_ai_generated = TRUE AND user_id IS NULL;

-- Verify the migration
SELECT 
    'Migration completed' as status,
    COUNT(*) as total_problems,
    COUNT(user_id) as problems_with_user,
    COUNT(*) - COUNT(user_id) as system_problems
FROM code_problems;