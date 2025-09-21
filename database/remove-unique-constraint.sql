-- Remove unique constraint to allow multiple problems per location
-- This allows multiple users to generate different problems for the same location

-- Check if the constraint exists and drop it
SELECT CONSTRAINT_NAME 
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'code_problems' 
AND CONSTRAINT_TYPE = 'UNIQUE'
AND CONSTRAINT_NAME = 'unique_location';

-- Drop the unique constraint if it exists
ALTER TABLE code_problems DROP INDEX unique_location;

-- Add new indexes for better performance with multiple problems per location
ALTER TABLE code_problems 
ADD INDEX idx_location_latest (category, topic, subtopic, sort_order, created_at DESC),
ADD INDEX idx_title_location (category, topic, subtopic, title, created_at DESC);

-- Update column types to match the new schema
ALTER TABLE code_problems 
MODIFY COLUMN time_complexity VARCHAR(500),
MODIFY COLUMN space_complexity VARCHAR(500);

-- Add function_templates column if it doesn't exist
ALTER TABLE code_problems 
ADD COLUMN IF NOT EXISTS function_templates JSON 
COMMENT 'JSON object containing function templates for each supported language (javascript, python, java, cpp, c, csharp, go, rust, php, ruby)' 
AFTER test_cases;