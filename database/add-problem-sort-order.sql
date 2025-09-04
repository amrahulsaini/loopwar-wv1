-- Add sequential order column to problems table
-- This will allow problems to be displayed in a specific sequence within each subtopic

ALTER TABLE problems 
ADD COLUMN sort_order INT DEFAULT 0 AFTER subtopic_id,
ADD INDEX idx_problems_sort_order (subtopic_id, sort_order);

-- Update existing problems to have default sort_order based on their ID
-- This gives existing problems a basic sequential order
UPDATE problems 
SET sort_order = id 
WHERE sort_order = 0;

-- Optional: If you want to reset sort_order to start from 1 for each subtopic
-- Run this if you want problems numbered 1, 2, 3... within each subtopic
/*
SET @row_number = 0;
SET @prev_subtopic = 0;

UPDATE problems 
SET sort_order = (
    CASE 
        WHEN @prev_subtopic = subtopic_id THEN @row_number := @row_number + 1
        ELSE @row_number := 1 AND @prev_subtopic := subtopic_id
    END
)
ORDER BY subtopic_id, id;
*/
