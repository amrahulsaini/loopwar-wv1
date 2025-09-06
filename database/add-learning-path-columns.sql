-- Add missing columns to ai_learning_notes table for enhanced AI functionality
-- Run this on production database to fix the missing columns error

-- Check if columns exist before adding them
ALTER TABLE ai_learning_notes 
ADD COLUMN IF NOT EXISTS learning_path JSON,
ADD COLUMN IF NOT EXISTS connections JSON,
ADD COLUMN IF NOT EXISTS conversation_summary TEXT,
ADD COLUMN IF NOT EXISTS conversation_context TEXT;

-- If the above syntax doesn't work on your MySQL version, use these individual statements:
-- ALTER TABLE ai_learning_notes ADD COLUMN learning_path JSON;
-- ALTER TABLE ai_learning_notes ADD COLUMN connections JSON;
-- ALTER TABLE ai_learning_notes ADD COLUMN conversation_summary TEXT;
-- ALTER TABLE ai_learning_notes ADD COLUMN conversation_context TEXT;

-- Verify the columns were added
DESCRIBE ai_learning_notes;
