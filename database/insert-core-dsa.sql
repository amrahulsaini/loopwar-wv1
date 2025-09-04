-- =============================================
-- Insert Core DSA Topics Data
-- =============================================

-- Insert Core DSA Category
INSERT INTO categories (name, icon, description, sort_order) VALUES 
('Core DSA', 'Workflow', 'Fundamental Data Structures and Algorithms', 1);

-- Get the category ID (will be 1 if this is the first category)
SET @core_dsa_id = LAST_INSERT_ID();

-- Insert Topics for Core DSA
INSERT INTO topics (category_id, name, description, total_problems, difficulty_level, sort_order) VALUES
(@core_dsa_id, 'Array', 'Array manipulation, searching, and optimization techniques', 45, 'Beginner', 1),
(@core_dsa_id, 'String', 'String processing, pattern matching, and manipulation', 38, 'Beginner', 2),
(@core_dsa_id, 'Hash Table', 'Hash-based data structures and algorithms', 42, 'Intermediate', 3),
(@core_dsa_id, 'Sorting', 'Various sorting algorithms and their applications', 25, 'Beginner', 4),
(@core_dsa_id, 'Searching / Binary Search', 'Search algorithms with focus on binary search', 42, 'Intermediate', 5),
(@core_dsa_id, 'Two Pointers', 'Two pointer technique for array/string problems', 28, 'Intermediate', 6),
(@core_dsa_id, 'Stack', 'Stack data structure and its applications', 35, 'Beginner', 7),
(@core_dsa_id, 'Queue', 'Queue data structure and BFS applications', 22, 'Beginner', 8),
(@core_dsa_id, 'Linked List', 'Singly, doubly linked lists and operations', 40, 'Beginner', 9),
(@core_dsa_id, 'Tree', 'Tree data structure fundamentals', 55, 'Intermediate', 10),
(@core_dsa_id, 'Binary Tree', 'Binary tree traversals and operations', 48, 'Intermediate', 11),
(@core_dsa_id, 'Binary Search Tree', 'BST operations and balanced trees', 30, 'Intermediate', 12),
(@core_dsa_id, 'Graph', 'Graph algorithms and representations', 65, 'Advanced', 13),
(@core_dsa_id, 'DFS / BFS', 'Depth-first and breadth-first search algorithms', 52, 'Advanced', 14),
(@core_dsa_id, 'Dynamic Programming', 'DP patterns and optimization problems', 75, 'Advanced', 15);

-- Insert Subtopics
-- Array subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Array' AND category_id = @core_dsa_id), 'Two Pointers', 1),
((SELECT id FROM topics WHERE name = 'Array' AND category_id = @core_dsa_id), 'Sliding Window', 2),
((SELECT id FROM topics WHERE name = 'Array' AND category_id = @core_dsa_id), 'Prefix Sum', 3),
((SELECT id FROM topics WHERE name = 'Array' AND category_id = @core_dsa_id), 'Sorting', 4);

-- String subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'String' AND category_id = @core_dsa_id), 'String Matching', 1),
((SELECT id FROM topics WHERE name = 'String' AND category_id = @core_dsa_id), 'Palindrome', 2),
((SELECT id FROM topics WHERE name = 'String' AND category_id = @core_dsa_id), 'String Building', 3),
((SELECT id FROM topics WHERE name = 'String' AND category_id = @core_dsa_id), 'Pattern Recognition', 4);

-- Hash Table subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Hash Table' AND category_id = @core_dsa_id), 'Hash Map', 1),
((SELECT id FROM topics WHERE name = 'Hash Table' AND category_id = @core_dsa_id), 'Hash Set', 2),
((SELECT id FROM topics WHERE name = 'Hash Table' AND category_id = @core_dsa_id), 'Counting', 3),
((SELECT id FROM topics WHERE name = 'Hash Table' AND category_id = @core_dsa_id), 'Hash Function Design', 4);

-- Sorting subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Sorting' AND category_id = @core_dsa_id), 'Quick Sort', 1),
((SELECT id FROM topics WHERE name = 'Sorting' AND category_id = @core_dsa_id), 'Merge Sort', 2),
((SELECT id FROM topics WHERE name = 'Sorting' AND category_id = @core_dsa_id), 'Counting Sort', 3),
((SELECT id FROM topics WHERE name = 'Sorting' AND category_id = @core_dsa_id), 'Custom Comparators', 4);

-- Searching / Binary Search subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Searching / Binary Search' AND category_id = @core_dsa_id), 'Binary Search on Array', 1),
((SELECT id FROM topics WHERE name = 'Searching / Binary Search' AND category_id = @core_dsa_id), 'Search in Rotated Array', 2),
((SELECT id FROM topics WHERE name = 'Searching / Binary Search' AND category_id = @core_dsa_id), 'Lower/Upper Bound', 3),
((SELECT id FROM topics WHERE name = 'Searching / Binary Search' AND category_id = @core_dsa_id), 'Peak Element', 4);

-- Two Pointers subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Two Pointers' AND category_id = @core_dsa_id), 'Opposite Direction', 1),
((SELECT id FROM topics WHERE name = 'Two Pointers' AND category_id = @core_dsa_id), 'Same Direction', 2),
((SELECT id FROM topics WHERE name = 'Two Pointers' AND category_id = @core_dsa_id), 'Fast & Slow', 3),
((SELECT id FROM topics WHERE name = 'Two Pointers' AND category_id = @core_dsa_id), 'Three Pointers', 4);

-- Stack subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Stack' AND category_id = @core_dsa_id), 'Monotonic Stack', 1),
((SELECT id FROM topics WHERE name = 'Stack' AND category_id = @core_dsa_id), 'Next Greater Element', 2),
((SELECT id FROM topics WHERE name = 'Stack' AND category_id = @core_dsa_id), 'Valid Parentheses', 3),
((SELECT id FROM topics WHERE name = 'Stack' AND category_id = @core_dsa_id), 'Expression Evaluation', 4);

-- Queue subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Queue' AND category_id = @core_dsa_id), 'Deque', 1),
((SELECT id FROM topics WHERE name = 'Queue' AND category_id = @core_dsa_id), 'Priority Queue', 2),
((SELECT id FROM topics WHERE name = 'Queue' AND category_id = @core_dsa_id), 'Circular Queue', 3),
((SELECT id FROM topics WHERE name = 'Queue' AND category_id = @core_dsa_id), 'BFS Applications', 4);

-- Linked List subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Linked List' AND category_id = @core_dsa_id), 'Singly Linked List', 1),
((SELECT id FROM topics WHERE name = 'Linked List' AND category_id = @core_dsa_id), 'Doubly Linked List', 2),
((SELECT id FROM topics WHERE name = 'Linked List' AND category_id = @core_dsa_id), 'Circular List', 3),
((SELECT id FROM topics WHERE name = 'Linked List' AND category_id = @core_dsa_id), 'Fast/Slow Pointers', 4);

-- Tree subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Tree' AND category_id = @core_dsa_id), 'Tree Traversal', 1),
((SELECT id FROM topics WHERE name = 'Tree' AND category_id = @core_dsa_id), 'Binary Tree', 2),
((SELECT id FROM topics WHERE name = 'Tree' AND category_id = @core_dsa_id), 'N-ary Tree', 3),
((SELECT id FROM topics WHERE name = 'Tree' AND category_id = @core_dsa_id), 'Tree Construction', 4);

-- Binary Tree subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Binary Tree' AND category_id = @core_dsa_id), 'Preorder', 1),
((SELECT id FROM topics WHERE name = 'Binary Tree' AND category_id = @core_dsa_id), 'Inorder', 2),
((SELECT id FROM topics WHERE name = 'Binary Tree' AND category_id = @core_dsa_id), 'Postorder', 3),
((SELECT id FROM topics WHERE name = 'Binary Tree' AND category_id = @core_dsa_id), 'Level Order', 4),
((SELECT id FROM topics WHERE name = 'Binary Tree' AND category_id = @core_dsa_id), 'Tree Properties', 5);

-- Binary Search Tree subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Binary Search Tree' AND category_id = @core_dsa_id), 'BST Operations', 1),
((SELECT id FROM topics WHERE name = 'Binary Search Tree' AND category_id = @core_dsa_id), 'BST Validation', 2),
((SELECT id FROM topics WHERE name = 'Binary Search Tree' AND category_id = @core_dsa_id), 'BST Iterator', 3),
((SELECT id FROM topics WHERE name = 'Binary Search Tree' AND category_id = @core_dsa_id), 'Balanced BST', 4);

-- Graph subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Graph' AND category_id = @core_dsa_id), 'Graph Representation', 1),
((SELECT id FROM topics WHERE name = 'Graph' AND category_id = @core_dsa_id), 'Connected Components', 2),
((SELECT id FROM topics WHERE name = 'Graph' AND category_id = @core_dsa_id), 'Shortest Path', 3),
((SELECT id FROM topics WHERE name = 'Graph' AND category_id = @core_dsa_id), 'Minimum Spanning Tree', 4);

-- DFS / BFS subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'DFS / BFS' AND category_id = @core_dsa_id), 'Graph DFS', 1),
((SELECT id FROM topics WHERE name = 'DFS / BFS' AND category_id = @core_dsa_id), 'Graph BFS', 2),
((SELECT id FROM topics WHERE name = 'DFS / BFS' AND category_id = @core_dsa_id), 'Tree DFS', 3),
((SELECT id FROM topics WHERE name = 'DFS / BFS' AND category_id = @core_dsa_id), 'Matrix DFS/BFS', 4),
((SELECT id FROM topics WHERE name = 'DFS / BFS' AND category_id = @core_dsa_id), 'Topological Sort', 5);

-- Dynamic Programming subtopics
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
((SELECT id FROM topics WHERE name = 'Dynamic Programming' AND category_id = @core_dsa_id), '1D DP', 1),
((SELECT id FROM topics WHERE name = 'Dynamic Programming' AND category_id = @core_dsa_id), '2D DP', 2),
((SELECT id FROM topics WHERE name = 'Dynamic Programming' AND category_id = @core_dsa_id), 'LCS/LIS', 3),
((SELECT id FROM topics WHERE name = 'Dynamic Programming' AND category_id = @core_dsa_id), 'Knapsack', 4),
((SELECT id FROM topics WHERE name = 'Dynamic Programming' AND category_id = @core_dsa_id), 'Tree DP', 5),
((SELECT id FROM topics WHERE name = 'Dynamic Programming' AND category_id = @core_dsa_id), 'Digit DP', 6);

-- Verify the data
SELECT 
    c.name as category,
    t.name as topic,
    t.total_problems,
    GROUP_CONCAT(s.name ORDER BY s.sort_order) as subtopics
FROM categories c
JOIN topics t ON c.id = t.category_id
LEFT JOIN subtopics s ON t.id = s.topic_id
WHERE c.name = 'Core DSA'
GROUP BY c.id, t.id, t.sort_order
ORDER BY t.sort_order;
