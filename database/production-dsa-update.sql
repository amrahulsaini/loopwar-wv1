-- =============================================
-- PRODUCTION SQL QUERY FOR LOOPWAR DATABASE
-- Run this on your server database
-- =============================================

-- Use your database (replace with your actual database name)
USE loop_wv1;

-- Step 1: Get Core DSA category ID and store it
SET @core_dsa_id = (SELECT id FROM categories WHERE name = 'Core DSA');

-- Step 2: Clean existing Core DSA data
DELETE FROM subtopics WHERE topic_id IN (SELECT id FROM topics WHERE category_id = @core_dsa_id);
DELETE FROM topics WHERE category_id = @core_dsa_id;

-- Step 3: Insert updated Core DSA topics
INSERT INTO topics (category_id, name, description, total_problems, difficulty_level, sort_order, is_active, created_at, updated_at) VALUES
(@core_dsa_id, 'Arrays and Matrices', 'Array operations, matrix problems, and 2D array techniques', 65, 'Beginner', 1, TRUE, NOW(), NOW()),
(@core_dsa_id, 'Strings and Pattern Matching', 'String manipulation, pattern matching algorithms, and text processing', 45, 'Beginner', 2, TRUE, NOW(), NOW()),
(@core_dsa_id, 'Hash Tables and Maps', 'Hash-based data structures, frequency counting, and fast lookups', 40, 'Intermediate', 3, TRUE, NOW(), NOW()),
(@core_dsa_id, 'Sorting and Searching', 'Sorting algorithms, binary search, and search optimizations', 50, 'Intermediate', 4, TRUE, NOW(), NOW()),
(@core_dsa_id, 'Two Pointers and Sliding Window', 'Efficient array traversal techniques and window-based algorithms', 35, 'Intermediate', 5, TRUE, NOW(), NOW()),
(@core_dsa_id, 'Stacks and Queues', 'Linear data structures and their advanced applications', 45, 'Beginner', 6, TRUE, NOW(), NOW()),
(@core_dsa_id, 'Linked Lists', 'Dynamic linear data structures and pointer manipulation', 38, 'Beginner', 7, TRUE, NOW(), NOW()),
(@core_dsa_id, 'Trees and Binary Trees', 'Tree structures, traversals, and tree-based algorithms', 70, 'Intermediate', 8, TRUE, NOW(), NOW()),
(@core_dsa_id, 'Binary Search Trees and Heaps', 'Self-balancing trees and priority queue implementations', 42, 'Intermediate', 9, TRUE, NOW(), NOW()),
(@core_dsa_id, 'Graphs and Graph Algorithms', 'Graph representations, traversals, and advanced graph algorithms', 85, 'Advanced', 10, TRUE, NOW(), NOW()),
(@core_dsa_id, 'Dynamic Programming', 'Optimization problems, memoization, and DP patterns', 90, 'Advanced', 11, TRUE, NOW(), NOW()),
(@core_dsa_id, 'Greedy Algorithms', 'Greedy choice strategies and optimization problems', 35, 'Advanced', 12, TRUE, NOW(), NOW()),
(@core_dsa_id, 'Backtracking and Recursion', 'Recursive problem solving and exhaustive search techniques', 48, 'Advanced', 13, TRUE, NOW(), NOW()),
(@core_dsa_id, 'Bit Manipulation', 'Bitwise operations and bit-level problem solving', 25, 'Intermediate', 14, TRUE, NOW(), NOW()),
(@core_dsa_id, 'Advanced Data Structures', 'Specialized data structures for complex problems', 30, 'Advanced', 15, TRUE, NOW(), NOW());

-- Step 4: Insert subtopics for each topic
-- Arrays and Matrices subtopics
INSERT INTO subtopics (topic_id, name, sort_order, is_active, created_at, updated_at) VALUES
((SELECT id FROM topics WHERE name = 'Arrays and Matrices' AND category_id = @core_dsa_id), 'Array Fundamentals', 1, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Arrays and Matrices' AND category_id = @core_dsa_id), 'Subarray Problems', 2, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Arrays and Matrices' AND category_id = @core_dsa_id), 'Matrix Operations', 3, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Arrays and Matrices' AND category_id = @core_dsa_id), 'Array Rotations', 4, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Arrays and Matrices' AND category_id = @core_dsa_id), 'Prefix and Suffix Arrays', 5, TRUE, NOW(), NOW());

-- Strings and Pattern Matching subtopics
INSERT INTO subtopics (topic_id, name, sort_order, is_active, created_at, updated_at) VALUES
((SELECT id FROM topics WHERE name = 'Strings and Pattern Matching' AND category_id = @core_dsa_id), 'String Basics', 1, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Strings and Pattern Matching' AND category_id = @core_dsa_id), 'Palindromes', 2, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Strings and Pattern Matching' AND category_id = @core_dsa_id), 'KMP Algorithm', 3, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Strings and Pattern Matching' AND category_id = @core_dsa_id), 'String Hashing', 4, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Strings and Pattern Matching' AND category_id = @core_dsa_id), 'Anagrams and Permutations', 5, TRUE, NOW(), NOW());

-- Hash Tables and Maps subtopics
INSERT INTO subtopics (topic_id, name, sort_order, is_active, created_at, updated_at) VALUES
((SELECT id FROM topics WHERE name = 'Hash Tables and Maps' AND category_id = @core_dsa_id), 'Hash Map Basics', 1, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Hash Tables and Maps' AND category_id = @core_dsa_id), 'Frequency Counting', 2, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Hash Tables and Maps' AND category_id = @core_dsa_id), 'Hash Set Operations', 3, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Hash Tables and Maps' AND category_id = @core_dsa_id), 'Two Sum Variants', 4, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Hash Tables and Maps' AND category_id = @core_dsa_id), 'Custom Hash Functions', 5, TRUE, NOW(), NOW());

-- Sorting and Searching subtopics
INSERT INTO subtopics (topic_id, name, sort_order, is_active, created_at, updated_at) VALUES
((SELECT id FROM topics WHERE name = 'Sorting and Searching' AND category_id = @core_dsa_id), 'Basic Sorting Algorithms', 1, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Sorting and Searching' AND category_id = @core_dsa_id), 'Binary Search Fundamentals', 2, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Sorting and Searching' AND category_id = @core_dsa_id), 'Binary Search Variants', 3, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Sorting and Searching' AND category_id = @core_dsa_id), 'Custom Comparators', 4, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Sorting and Searching' AND category_id = @core_dsa_id), 'Search in Rotated Arrays', 5, TRUE, NOW(), NOW());

-- Two Pointers and Sliding Window subtopics
INSERT INTO subtopics (topic_id, name, sort_order, is_active, created_at, updated_at) VALUES
((SELECT id FROM topics WHERE name = 'Two Pointers and Sliding Window' AND category_id = @core_dsa_id), 'Two Pointers Technique', 1, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Two Pointers and Sliding Window' AND category_id = @core_dsa_id), 'Fast and Slow Pointers', 2, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Two Pointers and Sliding Window' AND category_id = @core_dsa_id), 'Fixed Window Size', 3, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Two Pointers and Sliding Window' AND category_id = @core_dsa_id), 'Variable Window Size', 4, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Two Pointers and Sliding Window' AND category_id = @core_dsa_id), 'Multiple Pointers', 5, TRUE, NOW(), NOW());

-- Stacks and Queues subtopics
INSERT INTO subtopics (topic_id, name, sort_order, is_active, created_at, updated_at) VALUES
((SELECT id FROM topics WHERE name = 'Stacks and Queues' AND category_id = @core_dsa_id), 'Stack Fundamentals', 1, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Stacks and Queues' AND category_id = @core_dsa_id), 'Monotonic Stack', 2, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Stacks and Queues' AND category_id = @core_dsa_id), 'Queue Operations', 3, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Stacks and Queues' AND category_id = @core_dsa_id), 'Priority Queues', 4, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Stacks and Queues' AND category_id = @core_dsa_id), 'Expression Evaluation', 5, TRUE, NOW(), NOW());

-- Linked Lists subtopics
INSERT INTO subtopics (topic_id, name, sort_order, is_active, created_at, updated_at) VALUES
((SELECT id FROM topics WHERE name = 'Linked Lists' AND category_id = @core_dsa_id), 'Singly Linked Lists', 1, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Linked Lists' AND category_id = @core_dsa_id), 'Doubly Linked Lists', 2, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Linked Lists' AND category_id = @core_dsa_id), 'Cycle Detection', 3, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Linked Lists' AND category_id = @core_dsa_id), 'List Reversal', 4, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Linked Lists' AND category_id = @core_dsa_id), 'Merge Operations', 5, TRUE, NOW(), NOW());

-- Trees and Binary Trees subtopics
INSERT INTO subtopics (topic_id, name, sort_order, is_active, created_at, updated_at) VALUES
((SELECT id FROM topics WHERE name = 'Trees and Binary Trees' AND category_id = @core_dsa_id), 'Tree Traversals', 1, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Trees and Binary Trees' AND category_id = @core_dsa_id), 'Tree Construction', 2, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Trees and Binary Trees' AND category_id = @core_dsa_id), 'Tree Properties', 3, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Trees and Binary Trees' AND category_id = @core_dsa_id), 'Lowest Common Ancestor', 4, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Trees and Binary Trees' AND category_id = @core_dsa_id), 'Tree Views and Paths', 5, TRUE, NOW(), NOW());

-- Binary Search Trees and Heaps subtopics
INSERT INTO subtopics (topic_id, name, sort_order, is_active, created_at, updated_at) VALUES
((SELECT id FROM topics WHERE name = 'Binary Search Trees and Heaps' AND category_id = @core_dsa_id), 'BST Operations', 1, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Binary Search Trees and Heaps' AND category_id = @core_dsa_id), 'BST Validation', 2, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Binary Search Trees and Heaps' AND category_id = @core_dsa_id), 'Heap Implementation', 3, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Binary Search Trees and Heaps' AND category_id = @core_dsa_id), 'Heap Sort', 4, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Binary Search Trees and Heaps' AND category_id = @core_dsa_id), 'Balanced Trees', 5, TRUE, NOW(), NOW());

-- Graphs and Graph Algorithms subtopics
INSERT INTO subtopics (topic_id, name, sort_order, is_active, created_at, updated_at) VALUES
((SELECT id FROM topics WHERE name = 'Graphs and Graph Algorithms' AND category_id = @core_dsa_id), 'Graph Representation', 1, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Graphs and Graph Algorithms' AND category_id = @core_dsa_id), 'DFS and BFS', 2, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Graphs and Graph Algorithms' AND category_id = @core_dsa_id), 'Shortest Path Algorithms', 3, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Graphs and Graph Algorithms' AND category_id = @core_dsa_id), 'Minimum Spanning Tree', 4, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Graphs and Graph Algorithms' AND category_id = @core_dsa_id), 'Topological Sorting', 5, TRUE, NOW(), NOW());

-- Dynamic Programming subtopics
INSERT INTO subtopics (topic_id, name, sort_order, is_active, created_at, updated_at) VALUES
((SELECT id FROM topics WHERE name = 'Dynamic Programming' AND category_id = @core_dsa_id), '1D Dynamic Programming', 1, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Dynamic Programming' AND category_id = @core_dsa_id), '2D Dynamic Programming', 2, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Dynamic Programming' AND category_id = @core_dsa_id), 'Knapsack Problems', 3, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Dynamic Programming' AND category_id = @core_dsa_id), 'LCS and LIS', 4, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Dynamic Programming' AND category_id = @core_dsa_id), 'Tree DP', 5, TRUE, NOW(), NOW());

-- Greedy Algorithms subtopics
INSERT INTO subtopics (topic_id, name, sort_order, is_active, created_at, updated_at) VALUES
((SELECT id FROM topics WHERE name = 'Greedy Algorithms' AND category_id = @core_dsa_id), 'Greedy Choice Strategy', 1, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Greedy Algorithms' AND category_id = @core_dsa_id), 'Activity Selection', 2, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Greedy Algorithms' AND category_id = @core_dsa_id), 'Interval Problems', 3, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Greedy Algorithms' AND category_id = @core_dsa_id), 'Huffman Coding', 4, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Greedy Algorithms' AND category_id = @core_dsa_id), 'Fractional Knapsack', 5, TRUE, NOW(), NOW());

-- Backtracking and Recursion subtopics
INSERT INTO subtopics (topic_id, name, sort_order, is_active, created_at, updated_at) VALUES
((SELECT id FROM topics WHERE name = 'Backtracking and Recursion' AND category_id = @core_dsa_id), 'Recursion Fundamentals', 1, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Backtracking and Recursion' AND category_id = @core_dsa_id), 'Permutations and Combinations', 2, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Backtracking and Recursion' AND category_id = @core_dsa_id), 'N-Queens Problem', 3, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Backtracking and Recursion' AND category_id = @core_dsa_id), 'Sudoku Solver', 4, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Backtracking and Recursion' AND category_id = @core_dsa_id), 'Subset Generation', 5, TRUE, NOW(), NOW());

-- Bit Manipulation subtopics
INSERT INTO subtopics (topic_id, name, sort_order, is_active, created_at, updated_at) VALUES
((SELECT id FROM topics WHERE name = 'Bit Manipulation' AND category_id = @core_dsa_id), 'Bitwise Operations', 1, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Bit Manipulation' AND category_id = @core_dsa_id), 'Bit Masking', 2, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Bit Manipulation' AND category_id = @core_dsa_id), 'XOR Properties', 3, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Bit Manipulation' AND category_id = @core_dsa_id), 'Single Number Problems', 4, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Bit Manipulation' AND category_id = @core_dsa_id), 'Bit Counting', 5, TRUE, NOW(), NOW());

-- Advanced Data Structures subtopics
INSERT INTO subtopics (topic_id, name, sort_order, is_active, created_at, updated_at) VALUES
((SELECT id FROM topics WHERE name = 'Advanced Data Structures' AND category_id = @core_dsa_id), 'Trie (Prefix Tree)', 1, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Advanced Data Structures' AND category_id = @core_dsa_id), 'Segment Tree', 2, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Advanced Data Structures' AND category_id = @core_dsa_id), 'Binary Indexed Tree', 3, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Advanced Data Structures' AND category_id = @core_dsa_id), 'Disjoint Set Union', 4, TRUE, NOW(), NOW()),
((SELECT id FROM topics WHERE name = 'Advanced Data Structures' AND category_id = @core_dsa_id), 'Sparse Table', 5, TRUE, NOW(), NOW());

-- Step 5: Verify the update
SELECT 'Update completed successfully!' as Status;

-- Step 6: Show summary
SELECT 
    'Topics' as Type,
    COUNT(*) as Count
FROM topics 
WHERE category_id = @core_dsa_id

UNION ALL

SELECT 
    'Subtopics' as Type,
    COUNT(*) as Count
FROM subtopics s
JOIN topics t ON s.topic_id = t.id
WHERE t.category_id = @core_dsa_id;

-- Step 7: Show all updated topics
SELECT 
    t.name as 'Topic Name',
    t.total_problems as 'Problems',
    t.difficulty_level as 'Difficulty',
    COUNT(s.id) as 'Subtopics'
FROM topics t
LEFT JOIN subtopics s ON t.id = s.topic_id
WHERE t.category_id = @core_dsa_id
GROUP BY t.id, t.name, t.total_problems, t.difficulty_level
ORDER BY t.sort_order;
