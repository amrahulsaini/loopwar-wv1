-- =============================================
-- SIMPLE DSA CORE TOPICS UPDATE
-- Execute this step by step
-- =============================================

-- Step 1: Backup existing data (Optional but recommended)
-- CREATE TABLE topics_backup AS SELECT * FROM topics WHERE category_id = (SELECT id FROM categories WHERE name = 'Core DSA');
-- CREATE TABLE subtopics_backup AS SELECT * FROM subtopics WHERE topic_id IN (SELECT id FROM topics WHERE category_id = (SELECT id FROM categories WHERE name = 'Core DSA'));

-- Step 2: Get Core DSA category ID
SET @core_dsa_id = (SELECT id FROM categories WHERE name = 'Core DSA');

-- Step 3: Clear existing DSA topics and subtopics
DELETE FROM subtopics WHERE topic_id IN (SELECT id FROM topics WHERE category_id = @core_dsa_id);
DELETE FROM topics WHERE category_id = @core_dsa_id;

-- Step 4: Insert updated topics
INSERT INTO topics (category_id, name, description, total_problems, difficulty_level, sort_order) VALUES
(@core_dsa_id, 'Arrays and Matrices', 'Array operations and matrix problems', 65, 'Beginner', 1),
(@core_dsa_id, 'Strings and Pattern Matching', 'String manipulation and pattern algorithms', 45, 'Beginner', 2),
(@core_dsa_id, 'Hash Tables and Maps', 'Hash-based data structures', 40, 'Intermediate', 3),
(@core_dsa_id, 'Sorting and Searching', 'Sorting algorithms and binary search', 50, 'Intermediate', 4),
(@core_dsa_id, 'Two Pointers and Sliding Window', 'Efficient array traversal techniques', 35, 'Intermediate', 5),
(@core_dsa_id, 'Stacks and Queues', 'Linear data structures', 45, 'Beginner', 6),
(@core_dsa_id, 'Linked Lists', 'Dynamic linear data structures', 38, 'Beginner', 7),
(@core_dsa_id, 'Trees and Binary Trees', 'Tree structures and algorithms', 70, 'Intermediate', 8),
(@core_dsa_id, 'Binary Search Trees and Heaps', 'Self-balancing trees and priority queues', 42, 'Intermediate', 9),
(@core_dsa_id, 'Graphs and Graph Algorithms', 'Graph algorithms and traversals', 85, 'Advanced', 10),
(@core_dsa_id, 'Dynamic Programming', 'Optimization and memoization', 90, 'Advanced', 11),
(@core_dsa_id, 'Greedy Algorithms', 'Greedy choice strategies', 35, 'Advanced', 12),
(@core_dsa_id, 'Backtracking and Recursion', 'Recursive problem solving', 48, 'Advanced', 13),
(@core_dsa_id, 'Bit Manipulation', 'Bitwise operations', 25, 'Intermediate', 14),
(@core_dsa_id, 'Advanced Data Structures', 'Specialized data structures', 30, 'Advanced', 15);

-- Step 5: Insert key subtopics (Essential ones only)
-- Arrays and Matrices
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Arrays and Matrices' AND category_id = @core_dsa_id), 'Array Fundamentals', 1),
((SELECT id FROM topics WHERE name = 'Arrays and Matrices' AND category_id = @core_dsa_id), 'Subarray Problems', 2),
((SELECT id FROM topics WHERE name = 'Arrays and Matrices' AND category_id = @core_dsa_id), 'Matrix Operations', 3);

-- Strings and Pattern Matching
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Strings and Pattern Matching' AND category_id = @core_dsa_id), 'String Basics', 1),
((SELECT id FROM topics WHERE name = 'Strings and Pattern Matching' AND category_id = @core_dsa_id), 'Palindromes', 2),
((SELECT id FROM topics WHERE name = 'Strings and Pattern Matching' AND category_id = @core_dsa_id), 'Pattern Matching', 3);

-- Hash Tables and Maps
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Hash Tables and Maps' AND category_id = @core_dsa_id), 'Hash Map Basics', 1),
((SELECT id FROM topics WHERE name = 'Hash Tables and Maps' AND category_id = @core_dsa_id), 'Frequency Counting', 2),
((SELECT id FROM topics WHERE name = 'Hash Tables and Maps' AND category_id = @core_dsa_id), 'Two Sum Variants', 3);

-- Continue for other topics...
-- (You can add more subtopics as needed)

-- Step 6: Verify the update
SELECT 
    t.name as Topic,
    t.total_problems as Problems,
    COUNT(s.id) as Subtopics
FROM topics t
LEFT JOIN subtopics s ON t.id = s.topic_id
WHERE t.category_id = @core_dsa_id
GROUP BY t.id, t.name, t.total_problems
ORDER BY t.sort_order;
