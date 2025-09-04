-- =============================================
-- Updated Core DSA Topics and Subtopics
-- Based on Modern Competitive Programming Curriculum
-- =============================================

-- Clear existing data for Core DSA (be careful with this in production)
DELETE FROM subtopics WHERE topic_id IN (SELECT id FROM topics WHERE category_id = (SELECT id FROM categories WHERE name = 'Core DSA'));
DELETE FROM topics WHERE category_id = (SELECT id FROM categories WHERE name = 'Core DSA');

-- Get Core DSA category ID
SET @core_dsa_id = (SELECT id FROM categories WHERE name = 'Core DSA');

-- =============================================
-- UPDATED TOPICS FOR CORE DSA
-- =============================================

-- 1. Arrays and Matrices
INSERT INTO topics (category_id, name, description, total_problems, difficulty_level, sort_order) VALUES
(@core_dsa_id, 'Arrays and Matrices', 'Array operations, matrix problems, and 2D array techniques', 65, 'Beginner', 1);

-- 2. Strings and Pattern Matching
INSERT INTO topics (category_id, name, description, total_problems, difficulty_level, sort_order) VALUES
(@core_dsa_id, 'Strings and Pattern Matching', 'String manipulation, pattern matching algorithms, and text processing', 45, 'Beginner', 2);

-- 3. Hash Tables and Maps
INSERT INTO topics (category_id, name, description, total_problems, difficulty_level, sort_order) VALUES
(@core_dsa_id, 'Hash Tables and Maps', 'Hash-based data structures, frequency counting, and fast lookups', 40, 'Intermediate', 3);

-- 4. Sorting and Searching
INSERT INTO topics (category_id, name, description, total_problems, difficulty_level, sort_order) VALUES
(@core_dsa_id, 'Sorting and Searching', 'Sorting algorithms, binary search, and search optimizations', 50, 'Intermediate', 4);

-- 5. Two Pointers and Sliding Window
INSERT INTO topics (category_id, name, description, total_problems, difficulty_level, sort_order) VALUES
(@core_dsa_id, 'Two Pointers and Sliding Window', 'Efficient array traversal techniques and window-based algorithms', 35, 'Intermediate', 5);

-- 6. Stacks and Queues
INSERT INTO topics (category_id, name, description, total_problems, difficulty_level, sort_order) VALUES
(@core_dsa_id, 'Stacks and Queues', 'Linear data structures and their advanced applications', 45, 'Beginner', 6);

-- 7. Linked Lists
INSERT INTO topics (category_id, name, description, total_problems, difficulty_level, sort_order) VALUES
(@core_dsa_id, 'Linked Lists', 'Dynamic linear data structures and pointer manipulation', 38, 'Beginner', 7);

-- 8. Trees and Binary Trees
INSERT INTO topics (category_id, name, description, total_problems, difficulty_level, sort_order) VALUES
(@core_dsa_id, 'Trees and Binary Trees', 'Tree structures, traversals, and tree-based algorithms', 70, 'Intermediate', 8);

-- 9. Binary Search Trees and Heaps
INSERT INTO topics (category_id, name, description, total_problems, difficulty_level, sort_order) VALUES
(@core_dsa_id, 'Binary Search Trees and Heaps', 'Self-balancing trees and priority queue implementations', 42, 'Intermediate', 9);

-- 10. Graphs and Graph Algorithms
INSERT INTO topics (category_id, name, description, total_problems, difficulty_level, sort_order) VALUES
(@core_dsa_id, 'Graphs and Graph Algorithms', 'Graph representations, traversals, and advanced graph algorithms', 85, 'Advanced', 10);

-- 11. Dynamic Programming
INSERT INTO topics (category_id, name, description, total_problems, difficulty_level, sort_order) VALUES
(@core_dsa_id, 'Dynamic Programming', 'Optimization problems, memoization, and DP patterns', 90, 'Advanced', 11);

-- 12. Greedy Algorithms
INSERT INTO topics (category_id, name, description, total_problems, difficulty_level, sort_order) VALUES
(@core_dsa_id, 'Greedy Algorithms', 'Greedy choice strategies and optimization problems', 35, 'Advanced', 12);

-- 13. Backtracking and Recursion
INSERT INTO topics (category_id, name, description, total_problems, difficulty_level, sort_order) VALUES
(@core_dsa_id, 'Backtracking and Recursion', 'Recursive problem solving and exhaustive search techniques', 48, 'Advanced', 13);

-- 14. Bit Manipulation
INSERT INTO topics (category_id, name, description, total_problems, difficulty_level, sort_order) VALUES
(@core_dsa_id, 'Bit Manipulation', 'Bitwise operations and bit-level problem solving', 25, 'Intermediate', 14);

-- 15. Advanced Data Structures
INSERT INTO topics (category_id, name, description, total_problems, difficulty_level, sort_order) VALUES
(@core_dsa_id, 'Advanced Data Structures', 'Specialized data structures for complex problems', 30, 'Advanced', 15);

-- =============================================
-- SUBTOPICS FOR EACH TOPIC
-- =============================================

-- Arrays and Matrices Subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Arrays and Matrices' AND category_id = @core_dsa_id), 'Array Fundamentals', 1),
((SELECT id FROM topics WHERE name = 'Arrays and Matrices' AND category_id = @core_dsa_id), 'Subarray Problems', 2),
((SELECT id FROM topics WHERE name = 'Arrays and Matrices' AND category_id = @core_dsa_id), 'Matrix Operations', 3),
((SELECT id FROM topics WHERE name = 'Arrays and Matrices' AND category_id = @core_dsa_id), 'Array Rotations', 4),
((SELECT id FROM topics WHERE name = 'Arrays and Matrices' AND category_id = @core_dsa_id), 'Prefix and Suffix Arrays', 5);

-- Strings and Pattern Matching Subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Strings and Pattern Matching' AND category_id = @core_dsa_id), 'String Basics', 1),
((SELECT id FROM topics WHERE name = 'Strings and Pattern Matching' AND category_id = @core_dsa_id), 'Palindromes', 2),
((SELECT id FROM topics WHERE name = 'Strings and Pattern Matching' AND category_id = @core_dsa_id), 'KMP Algorithm', 3),
((SELECT id FROM topics WHERE name = 'Strings and Pattern Matching' AND category_id = @core_dsa_id), 'String Hashing', 4),
((SELECT id FROM topics WHERE name = 'Strings and Pattern Matching' AND category_id = @core_dsa_id), 'Anagrams and Permutations', 5);

-- Hash Tables and Maps Subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Hash Tables and Maps' AND category_id = @core_dsa_id), 'Hash Map Basics', 1),
((SELECT id FROM topics WHERE name = 'Hash Tables and Maps' AND category_id = @core_dsa_id), 'Frequency Counting', 2),
((SELECT id FROM topics WHERE name = 'Hash Tables and Maps' AND category_id = @core_dsa_id), 'Hash Set Operations', 3),
((SELECT id FROM topics WHERE name = 'Hash Tables and Maps' AND category_id = @core_dsa_id), 'Two Sum Variants', 4),
((SELECT id FROM topics WHERE name = 'Hash Tables and Maps' AND category_id = @core_dsa_id), 'Custom Hash Functions', 5);

-- Sorting and Searching Subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Sorting and Searching' AND category_id = @core_dsa_id), 'Basic Sorting Algorithms', 1),
((SELECT id FROM topics WHERE name = 'Sorting and Searching' AND category_id = @core_dsa_id), 'Binary Search Fundamentals', 2),
((SELECT id FROM topics WHERE name = 'Sorting and Searching' AND category_id = @core_dsa_id), 'Binary Search Variants', 3),
((SELECT id FROM topics WHERE name = 'Sorting and Searching' AND category_id = @core_dsa_id), 'Custom Comparators', 4),
((SELECT id FROM topics WHERE name = 'Sorting and Searching' AND category_id = @core_dsa_id), 'Search in Rotated Arrays', 5);

-- Two Pointers and Sliding Window Subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Two Pointers and Sliding Window' AND category_id = @core_dsa_id), 'Two Pointers Technique', 1),
((SELECT id FROM topics WHERE name = 'Two Pointers and Sliding Window' AND category_id = @core_dsa_id), 'Fast and Slow Pointers', 2),
((SELECT id FROM topics WHERE name = 'Two Pointers and Sliding Window' AND category_id = @core_dsa_id), 'Fixed Window Size', 3),
((SELECT id FROM topics WHERE name = 'Two Pointers and Sliding Window' AND category_id = @core_dsa_id), 'Variable Window Size', 4),
((SELECT id FROM topics WHERE name = 'Two Pointers and Sliding Window' AND category_id = @core_dsa_id), 'Multiple Pointers', 5);

-- Stacks and Queues Subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Stacks and Queues' AND category_id = @core_dsa_id), 'Stack Fundamentals', 1),
((SELECT id FROM topics WHERE name = 'Stacks and Queues' AND category_id = @core_dsa_id), 'Monotonic Stack', 2),
((SELECT id FROM topics WHERE name = 'Stacks and Queues' AND category_id = @core_dsa_id), 'Queue Operations', 3),
((SELECT id FROM topics WHERE name = 'Stacks and Queues' AND category_id = @core_dsa_id), 'Priority Queues', 4),
((SELECT id FROM topics WHERE name = 'Stacks and Queues' AND category_id = @core_dsa_id), 'Expression Evaluation', 5);

-- Linked Lists Subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Linked Lists' AND category_id = @core_dsa_id), 'Singly Linked Lists', 1),
((SELECT id FROM topics WHERE name = 'Linked Lists' AND category_id = @core_dsa_id), 'Doubly Linked Lists', 2),
((SELECT id FROM topics WHERE name = 'Linked Lists' AND category_id = @core_dsa_id), 'Cycle Detection', 3),
((SELECT id FROM topics WHERE name = 'Linked Lists' AND category_id = @core_dsa_id), 'List Reversal', 4),
((SELECT id FROM topics WHERE name = 'Linked Lists' AND category_id = @core_dsa_id), 'Merge Operations', 5);

-- Trees and Binary Trees Subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Trees and Binary Trees' AND category_id = @core_dsa_id), 'Tree Traversals', 1),
((SELECT id FROM topics WHERE name = 'Trees and Binary Trees' AND category_id = @core_dsa_id), 'Tree Construction', 2),
((SELECT id FROM topics WHERE name = 'Trees and Binary Trees' AND category_id = @core_dsa_id), 'Tree Properties', 3),
((SELECT id FROM topics WHERE name = 'Trees and Binary Trees' AND category_id = @core_dsa_id), 'Lowest Common Ancestor', 4),
((SELECT id FROM topics WHERE name = 'Trees and Binary Trees' AND category_id = @core_dsa_id), 'Tree Views and Paths', 5);

-- Binary Search Trees and Heaps Subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Binary Search Trees and Heaps' AND category_id = @core_dsa_id), 'BST Operations', 1),
((SELECT id FROM topics WHERE name = 'Binary Search Trees and Heaps' AND category_id = @core_dsa_id), 'BST Validation', 2),
((SELECT id FROM topics WHERE name = 'Binary Search Trees and Heaps' AND category_id = @core_dsa_id), 'Heap Implementation', 3),
((SELECT id FROM topics WHERE name = 'Binary Search Trees and Heaps' AND category_id = @core_dsa_id), 'Heap Sort', 4),
((SELECT id FROM topics WHERE name = 'Binary Search Trees and Heaps' AND category_id = @core_dsa_id), 'Balanced Trees', 5);

-- Graphs and Graph Algorithms Subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Graphs and Graph Algorithms' AND category_id = @core_dsa_id), 'Graph Representation', 1),
((SELECT id FROM topics WHERE name = 'Graphs and Graph Algorithms' AND category_id = @core_dsa_id), 'DFS and BFS', 2),
((SELECT id FROM topics WHERE name = 'Graphs and Graph Algorithms' AND category_id = @core_dsa_id), 'Shortest Path Algorithms', 3),
((SELECT id FROM topics WHERE name = 'Graphs and Graph Algorithms' AND category_id = @core_dsa_id), 'Minimum Spanning Tree', 4),
((SELECT id FROM topics WHERE name = 'Graphs and Graph Algorithms' AND category_id = @core_dsa_id), 'Topological Sorting', 5);

-- Dynamic Programming Subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Dynamic Programming' AND category_id = @core_dsa_id), '1D Dynamic Programming', 1),
((SELECT id FROM topics WHERE name = 'Dynamic Programming' AND category_id = @core_dsa_id), '2D Dynamic Programming', 2),
((SELECT id FROM topics WHERE name = 'Dynamic Programming' AND category_id = @core_dsa_id), 'Knapsack Problems', 3),
((SELECT id FROM topics WHERE name = 'Dynamic Programming' AND category_id = @core_dsa_id), 'LCS and LIS', 4),
((SELECT id FROM topics WHERE name = 'Dynamic Programming' AND category_id = @core_dsa_id), 'Tree DP', 5);

-- Greedy Algorithms Subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Greedy Algorithms' AND category_id = @core_dsa_id), 'Greedy Choice Strategy', 1),
((SELECT id FROM topics WHERE name = 'Greedy Algorithms' AND category_id = @core_dsa_id), 'Activity Selection', 2),
((SELECT id FROM topics WHERE name = 'Greedy Algorithms' AND category_id = @core_dsa_id), 'Interval Problems', 3),
((SELECT id FROM topics WHERE name = 'Greedy Algorithms' AND category_id = @core_dsa_id), 'Huffman Coding', 4),
((SELECT id FROM topics WHERE name = 'Greedy Algorithms' AND category_id = @core_dsa_id), 'Fractional Knapsack', 5);

-- Backtracking and Recursion Subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Backtracking and Recursion' AND category_id = @core_dsa_id), 'Recursion Fundamentals', 1),
((SELECT id FROM topics WHERE name = 'Backtracking and Recursion' AND category_id = @core_dsa_id), 'Permutations and Combinations', 2),
((SELECT id FROM topics WHERE name = 'Backtracking and Recursion' AND category_id = @core_dsa_id), 'N-Queens Problem', 3),
((SELECT id FROM topics WHERE name = 'Backtracking and Recursion' AND category_id = @core_dsa_id), 'Sudoku Solver', 4),
((SELECT id FROM topics WHERE name = 'Backtracking and Recursion' AND category_id = @core_dsa_id), 'Subset Generation', 5);

-- Bit Manipulation Subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Bit Manipulation' AND category_id = @core_dsa_id), 'Bitwise Operations', 1),
((SELECT id FROM topics WHERE name = 'Bit Manipulation' AND category_id = @core_dsa_id), 'Bit Masking', 2),
((SELECT id FROM topics WHERE name = 'Bit Manipulation' AND category_id = @core_dsa_id), 'XOR Properties', 3),
((SELECT id FROM topics WHERE name = 'Bit Manipulation' AND category_id = @core_dsa_id), 'Single Number Problems', 4),
((SELECT id FROM topics WHERE name = 'Bit Manipulation' AND category_id = @core_dsa_id), 'Bit Counting', 5);

-- Advanced Data Structures Subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Advanced Data Structures' AND category_id = @core_dsa_id), 'Trie (Prefix Tree)', 1),
((SELECT id FROM topics WHERE name = 'Advanced Data Structures' AND category_id = @core_dsa_id), 'Segment Tree', 2),
((SELECT id FROM topics WHERE name = 'Advanced Data Structures' AND category_id = @core_dsa_id), 'Binary Indexed Tree', 3),
((SELECT id FROM topics WHERE name = 'Advanced Data Structures' AND category_id = @core_dsa_id), 'Disjoint Set Union', 4),
((SELECT id FROM topics WHERE name = 'Advanced Data Structures' AND category_id = @core_dsa_id), 'Sparse Table', 5);

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check if all topics were inserted
SELECT 'Topics Count' as Info, COUNT(*) as Count FROM topics WHERE category_id = @core_dsa_id;

-- Check if all subtopics were inserted
SELECT 'Subtopics Count' as Info, COUNT(*) as Count FROM subtopics 
WHERE topic_id IN (SELECT id FROM topics WHERE category_id = @core_dsa_id);

-- Show all topics with their subtopic counts
SELECT 
    t.name as Topic,
    t.total_problems as Problems,
    t.difficulty_level as Difficulty,
    COUNT(s.id) as Subtopics
FROM topics t
LEFT JOIN subtopics s ON t.id = s.topic_id
WHERE t.category_id = @core_dsa_id
GROUP BY t.id, t.name, t.total_problems, t.difficulty_level
ORDER BY t.sort_order;
