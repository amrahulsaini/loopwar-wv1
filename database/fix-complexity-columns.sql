-- Fix for time_complexity column length issue
-- Increase the column size to handle longer AI-generated complexity descriptions

USE loop_wv1;

-- Increase time_complexity column size
ALTER TABLE code_problems MODIFY COLUMN time_complexity VARCHAR(500);

-- Increase space_complexity column size (preventive)
ALTER TABLE code_problems MODIFY COLUMN space_complexity VARCHAR(500);

-- Add function_templates column if it doesn't exist
ALTER TABLE code_problems ADD COLUMN IF NOT EXISTS function_templates JSON;