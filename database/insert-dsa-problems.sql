-- ================================================================
-- DSA PROBLEMS DATA INSERTION SCRIPT
-- ================================================================
-- This script inserts actual Data Structures and Algorithms problems
-- with proper difficulty levels, problem statements, and constraints
-- 
-- Execute this script AFTER:
-- 1. database/topics-schema.sql (table creation)
-- 2. database/insert-core-dsa.sql (category/topics/subtopics)
-- ================================================================

USE loopwar_dsa;

-- ================================================================
-- ARRAY PROBLEMS
-- ================================================================

-- Two Sum (Easy)
INSERT INTO problems (topic_id, subtopic_id, title, description, difficulty, problem_statement, input_format, output_format, constraints, examples, hints, solution_approach, time_complexity, space_complexity, tags, created_at) 
VALUES (
    (SELECT id FROM topics WHERE name = 'Arrays and Strings'),
    (SELECT id FROM subtopics WHERE name = 'Array Fundamentals'),
    'Two Sum',
    'Find two numbers in an array that add up to a specific target.',
    'Easy',
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
    'First line contains n (length of array)\nSecond line contains n integers\nThird line contains target integer',
    'Two integers representing indices of the two numbers',
    '2 ≤ nums.length ≤ 10^4\n-10^9 ≤ nums[i] ≤ 10^9\n-10^9 ≤ target ≤ 10^9\nOnly one valid answer exists.',
    'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: nums[0] + nums[1] = 2 + 7 = 9\n\nInput: nums = [3,2,4], target = 6\nOutput: [1,2]',
    'Use a hash map to store numbers and their indices as you iterate through the array.',
    'HashMap approach: Store complement of each number',
    'O(n)',
    'O(n)',
    'array,hash-table,easy',
    NOW()
);

-- Maximum Subarray (Medium)
INSERT INTO problems (topic_id, subtopic_id, title, description, difficulty, problem_statement, input_format, output_format, constraints, examples, hints, solution_approach, time_complexity, space_complexity, tags, created_at) 
VALUES (
    (SELECT id FROM topics WHERE name = 'Arrays and Strings'),
    (SELECT id FROM subtopics WHERE name = 'Subarray Problems'),
    'Maximum Subarray',
    'Find the contiguous subarray with the largest sum.',
    'Medium',
    'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum. A subarray is a contiguous part of an array.',
    'First line contains n (length of array)\nSecond line contains n integers',
    'Single integer representing the maximum sum',
    '1 ≤ nums.length ≤ 10^5\n-10^4 ≤ nums[i] ≤ 10^4',
    'Input: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\nExplanation: [4,-1,2,1] has the largest sum = 6\n\nInput: nums = [1]\nOutput: 1',
    'Think about Kadane''s algorithm. Keep track of maximum sum ending at current position.',
    'Kadane''s Algorithm: Dynamic Programming approach',
    'O(n)',
    'O(1)',
    'array,dynamic-programming,kadane,medium',
    NOW()
);

-- 3Sum (Medium)
INSERT INTO problems (topic_id, subtopic_id, title, description, difficulty, problem_statement, input_format, output_format, constraints, examples, hints, solution_approach, time_complexity, space_complexity, tags, created_at) 
VALUES (
    (SELECT id FROM topics WHERE name = 'Arrays and Strings'),
    (SELECT id FROM subtopics WHERE name = 'Two Pointers'),
    '3Sum',
    'Find all unique triplets in array that sum to zero.',
    'Medium',
    'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0. Notice that the solution set must not contain duplicate triplets.',
    'First line contains n (length of array)\nSecond line contains n integers',
    'List of triplets, each triplet on a new line',
    '3 ≤ nums.length ≤ 3000\n-10^5 ≤ nums[i] ≤ 10^5',
    'Input: nums = [-1,0,1,2,-1,-4]\nOutput: [[-1,-1,2],[-1,0,1]]\n\nInput: nums = [0,1,1]\nOutput: []\nInput: nums = [0,0,0]\nOutput: [[0,0,0]]',
    'Sort the array first, then use two pointers technique for each element.',
    'Sort + Two Pointers: Fix one element, find pairs for remaining',
    'O(n²)',
    'O(1)',
    'array,two-pointers,sorting,medium',
    NOW()
);

-- ================================================================
-- LINKED LIST PROBLEMS  
-- ================================================================

-- Reverse Linked List (Easy)
INSERT INTO problems (topic_id, subtopic_id, title, description, difficulty, problem_statement, input_format, output_format, constraints, examples, hints, solution_approach, time_complexity, space_complexity, tags, created_at) 
VALUES (
    (SELECT id FROM topics WHERE name = 'Linked Lists'),
    (SELECT id FROM subtopics WHERE name = 'Basic Operations'),
    'Reverse Linked List',
    'Reverse a singly linked list iteratively or recursively.',
    'Easy',
    'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    'First line contains n (number of nodes)\nSecond line contains n integers representing node values',
    'Space-separated integers representing reversed list',
    '0 ≤ number of nodes ≤ 5000\n-5000 ≤ Node.val ≤ 5000',
    'Input: head = [1,2,3,4,5]\nOutput: [5,4,3,2,1]\n\nInput: head = [1,2]\nOutput: [2,1]\n\nInput: head = []\nOutput: []',
    'Use three pointers: previous, current, and next. Or think recursively.',
    'Iterative: Three pointers approach, Recursive: Base case + recursive call',
    'O(n)',
    'O(1) iterative, O(n) recursive',
    'linked-list,recursion,iterative,easy',
    NOW()
);

-- Merge Two Sorted Lists (Easy)
INSERT INTO problems (topic_id, subtopic_id, title, description, difficulty, problem_statement, input_format, output_format, constraints, examples, hints, solution_approach, time_complexity, space_complexity, tags, created_at) 
VALUES (
    (SELECT id FROM topics WHERE name = 'Linked Lists'),
    (SELECT id FROM subtopics WHERE name = 'Merging and Sorting'),
    'Merge Two Sorted Lists',
    'Merge two sorted linked lists into one sorted list.',
    'Easy',
    'You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a sorted manner and return the head of the merged linked list. The list should be made by splicing together the nodes of the first two lists.',
    'First line: n1 (nodes in list1)\nSecond line: n1 integers\nThird line: n2 (nodes in list2)\nFourth line: n2 integers',
    'Space-separated integers representing merged sorted list',
    '0 ≤ number of nodes in both lists ≤ 50\n-100 ≤ Node.val ≤ 100\nBoth lists are sorted in non-decreasing order',
    'Input: list1 = [1,2,4], list2 = [1,3,4]\nOutput: [1,1,2,3,4,4]\n\nInput: list1 = [], list2 = [0]\nOutput: [0]',
    'Use a dummy head to simplify edge cases. Compare values and link smaller node.',
    'Two pointers: Compare current nodes and link smaller one',
    'O(n + m)',
    'O(1)',
    'linked-list,merging,two-pointers,easy',
    NOW()
);

-- Detect Cycle in Linked List (Medium)
INSERT INTO problems (topic_id, subtopic_id, title, description, difficulty, problem_statement, input_format, output_format, constraints, examples, hints, solution_approach, time_complexity, space_complexity, tags, created_at) 
VALUES (
    (SELECT id FROM topics WHERE name = 'Linked Lists'),
    (SELECT id FROM subtopics WHERE name = 'Cycle Detection'),
    'Linked List Cycle',
    'Detect if a linked list has a cycle using Floyd''s algorithm.',
    'Medium',
    'Given head, the head of a linked list, determine if the linked list has a cycle in it. There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the next pointer.',
    'First line: n (number of nodes)\nSecond line: n integers (node values)\nThird line: pos (position where tail connects, -1 for no cycle)',
    'true if cycle exists, false otherwise',
    '0 ≤ number of nodes ≤ 10^4\n-10^5 ≤ Node.val ≤ 10^5\npos is -1 or valid index',
    'Input: head = [3,2,0,-4], pos = 1\nOutput: true\nExplanation: There is a cycle, tail connects to 2nd node\n\nInput: head = [1], pos = -1\nOutput: false',
    'Use Floyd''s Cycle Detection (tortoise and hare). Fast pointer moves 2 steps, slow moves 1.',
    'Floyd''s Cycle Detection: Two pointers at different speeds',
    'O(n)',
    'O(1)',
    'linked-list,cycle-detection,floyd-algorithm,medium',
    NOW()
);

-- ================================================================
-- STACK AND QUEUE PROBLEMS
-- ================================================================

-- Valid Parentheses (Easy)
INSERT INTO problems (topic_id, subtopic_id, title, description, difficulty, problem_statement, input_format, output_format, constraints, examples, hints, solution_approach, time_complexity, space_complexity, tags, created_at) 
VALUES (
    (SELECT id FROM topics WHERE name = 'Stacks and Queues'),
    (SELECT id FROM subtopics WHERE name = 'Stack Applications'),
    'Valid Parentheses',
    'Check if string of parentheses is properly balanced.',
    'Easy',
    'Given a string s containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order.',
    'Single line containing string of parentheses',
    'true if valid, false otherwise',
    '1 ≤ s.length ≤ 10^4\ns consists of parentheses only ''()[]{}''',
    'Input: s = "()"\nOutput: true\n\nInput: s = "()[]{}"\nOutput: true\n\nInput: s = "(]"\nOutput: false',
    'Use a stack to keep track of opening brackets. When you see closing bracket, check if it matches the most recent opening bracket.',
    'Stack: Push opening brackets, pop and match closing brackets',
    'O(n)',
    'O(n)',
    'stack,string,parentheses,easy',
    NOW()
);

-- Implement Queue using Stacks (Easy)
INSERT INTO problems (topic_id, subtopic_id, title, description, difficulty, problem_statement, input_format, output_format, constraints, examples, hints, solution_approach, time_complexity, space_complexity, tags, created_at) 
VALUES (
    (SELECT id FROM topics WHERE name = 'Stacks and Queues'),
    (SELECT id FROM subtopics WHERE name = 'Queue Implementation'),
    'Implement Queue using Stacks',
    'Implement FIFO queue using only two stacks.',
    'Easy',
    'Implement a first in first out (FIFO) queue using only two stacks. The implemented queue should support all the functions of a normal queue (push, peek, pop, and empty).',
    'Multiple lines with operations:\nMyQueue obj = new MyQueue();\nobj.push(x);\nint param_2 = obj.pop();\nint param_3 = obj.peek();\nboolean param_4 = obj.empty();',
    'Results of operations as requested',
    '1 ≤ x ≤ 9\nAt most 100 calls will be made to push, pop, peek, and empty.\nAll calls to pop and peek are valid.',
    'Input:\n["MyQueue", "push", "push", "peek", "pop", "empty"]\n[[], [1], [2], [], [], []]\nOutput:\n[null, null, null, 1, 1, false]',
    'Use two stacks: one for enqueue operations, another for dequeue operations.',
    'Two Stacks: Input stack for push, output stack for pop/peek',
    'O(1) amortized',
    'O(n)',
    'stack,queue,design,easy',
    NOW()
);

-- Daily Temperatures (Medium)
INSERT INTO problems (topic_id, subtopic_id, title, description, difficulty, problem_statement, input_format, output_format, constraints, examples, hints, solution_approach, time_complexity, space_complexity, tags, created_at) 
VALUES (
    (SELECT id FROM topics WHERE name = 'Stacks and Queues'),
    (SELECT id FROM subtopics WHERE name = 'Monotonic Stack'),
    'Daily Temperatures',
    'Find how many days until warmer temperature using monotonic stack.',
    'Medium',
    'Given an array of integers temperatures represents the daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature. If there is no future day for which this is possible, keep answer[i] == 0 instead.',
    'First line: n (number of days)\nSecond line: n integers representing temperatures',
    'n integers representing days to wait for warmer temperature',
    '1 ≤ temperatures.length ≤ 10^5\n30 ≤ temperatures[i] ≤ 100',
    'Input: temperatures = [73,74,75,71,69,72,76,73]\nOutput: [1,1,4,2,1,1,0,0]\n\nInput: temperatures = [30,40,50,60]\nOutput: [1,1,1,0]',
    'Use a monotonic decreasing stack to keep track of temperatures waiting for warmer days.',
    'Monotonic Stack: Maintain decreasing stack of indices',
    'O(n)',
    'O(n)',
    'stack,monotonic-stack,array,medium',
    NOW()
);

-- ================================================================
-- BINARY TREE PROBLEMS
-- ================================================================

-- Maximum Depth of Binary Tree (Easy)
INSERT INTO problems (topic_id, subtopic_id, title, description, difficulty, problem_statement, input_format, output_format, constraints, examples, hints, solution_approach, time_complexity, space_complexity, tags, created_at) 
VALUES (
    (SELECT id FROM topics WHERE name = 'Trees and Graphs'),
    (SELECT id FROM subtopics WHERE name = 'Tree Traversals'),
    'Maximum Depth of Binary Tree',
    'Find the maximum depth (height) of a binary tree.',
    'Easy',
    'Given the root of a binary tree, return its maximum depth. A binary tree''s maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.',
    'First line: n (number of nodes)\nNext lines: node_value left_child_index right_child_index (-1 for null)',
    'Single integer representing maximum depth',
    '0 ≤ number of nodes ≤ 10^4\n-100 ≤ Node.val ≤ 100',
    'Input: root = [3,9,20,null,null,15,7]\nOutput: 3\n\nInput: root = [1,null,2]\nOutput: 2',
    'Use recursion: depth = 1 + max(left_depth, right_depth). Or use level-order traversal.',
    'Recursion: max(left_subtree_depth, right_subtree_depth) + 1',
    'O(n)',
    'O(h) where h is height',
    'tree,recursion,depth-first-search,easy',
    NOW()
);

-- Binary Tree Inorder Traversal (Easy)
INSERT INTO problems (topic_id, subtopic_id, title, description, difficulty, problem_statement, input_format, output_format, constraints, examples, hints, solution_approach, time_complexity, space_complexity, tags, created_at) 
VALUES (
    (SELECT id FROM topics WHERE name = 'Trees and Graphs'),
    (SELECT id FROM subtopics WHERE name = 'Tree Traversals'),
    'Binary Tree Inorder Traversal',
    'Perform inorder traversal of binary tree iteratively and recursively.',
    'Easy',
    'Given the root of a binary tree, return the inorder traversal of its nodes'' values.',
    'First line: n (number of nodes)\nNext lines: node_value left_child_index right_child_index (-1 for null)',
    'Space-separated integers in inorder sequence',
    '0 ≤ number of nodes ≤ 100\n-100 ≤ Node.val ≤ 100',
    'Input: root = [1,null,2,3]\nOutput: [1,3,2]\n\nInput: root = []\nOutput: []\n\nInput: root = [1]\nOutput: [1]',
    'Recursive: left, root, right. Iterative: use stack to simulate recursion.',
    'Recursion or Stack-based iteration: Left → Root → Right',
    'O(n)',
    'O(h) recursive, O(h) iterative',
    'tree,stack,recursion,inorder,easy',
    NOW()
);

-- Validate Binary Search Tree (Medium)
INSERT INTO problems (topic_id, subtopic_id, title, description, difficulty, problem_statement, input_format, output_format, constraints, examples, hints, solution_approach, time_complexity, space_complexity, tags, created_at) 
VALUES (
    (SELECT id FROM topics WHERE name = 'Trees and Graphs'),
    (SELECT id FROM subtopics WHERE name = 'Binary Search Trees'),
    'Validate Binary Search Tree',
    'Check if a binary tree is a valid binary search tree.',
    'Medium',
    'Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST is defined as follows: The left subtree of a node contains only nodes with keys less than the node''s key. The right subtree contains only nodes with keys greater than the node''s key. Both subtrees must also be BSTs.',
    'First line: n (number of nodes)\nNext lines: node_value left_child_index right_child_index (-1 for null)',
    'true if valid BST, false otherwise',
    '1 ≤ number of nodes ≤ 10^4\n-2^31 ≤ Node.val ≤ 2^31 - 1',
    'Input: root = [2,1,3]\nOutput: true\n\nInput: root = [5,1,4,null,null,3,6]\nOutput: false\nExplanation: Root is 5 but right child 4 < 5',
    'Pass min and max bounds to each recursive call. Or use inorder traversal property.',
    'Recursion with bounds: Pass valid range for each node',
    'O(n)',
    'O(h)',
    'tree,binary-search-tree,recursion,medium',
    NOW()
);

-- ================================================================
-- GRAPH PROBLEMS
-- ================================================================

-- Number of Islands (Medium)
INSERT INTO problems (topic_id, subtopic_id, title, description, difficulty, problem_statement, input_format, output_format, constraints, examples, hints, solution_approach, time_complexity, space_complexity, tags, created_at) 
VALUES (
    (SELECT id FROM topics WHERE name = 'Trees and Graphs'),
    (SELECT id FROM subtopics WHERE name = 'Graph Traversal (DFS/BFS)'),
    'Number of Islands',
    'Count number of islands in 2D binary grid using DFS/BFS.',
    'Medium',
    'Given an m x n 2D binary grid which represents a map of ''1''s (land) and ''0''s (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.',
    'First line: m n (dimensions)\nNext m lines: n characters (0 or 1)',
    'Single integer representing number of islands',
    '1 ≤ m, n ≤ 300\ngrid[i][j] is ''0'' or ''1''',
    'Input:\ngrid = [\n  ["1","1","1","1","0"],\n  ["1","1","0","1","0"],\n  ["1","1","0","0","0"],\n  ["0","0","0","0","0"]\n]\nOutput: 1',
    'Use DFS or BFS to explore each island. Mark visited cells to avoid counting twice.',
    'DFS/BFS: For each unvisited land cell, explore entire island',
    'O(m × n)',
    'O(m × n)',
    'graph,dfs,bfs,grid,matrix,medium',
    NOW()
);

-- Course Schedule (Medium)
INSERT INTO problems (topic_id, subtopic_id, title, description, difficulty, problem_statement, input_format, output_format, constraints, examples, hints, solution_approach, time_complexity, space_complexity, tags, created_at) 
VALUES (
    (SELECT id FROM topics WHERE name = 'Trees and Graphs'),
    (SELECT id FROM subtopics WHERE name = 'Topological Sorting'),
    'Course Schedule',
    'Determine if you can finish all courses (detect cycle in directed graph).',
    'Medium',
    'There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai. Return true if you can finish all courses. Otherwise, return false.',
    'First line: numCourses\nSecond line: number of prerequisites\nNext lines: ai bi (prerequisite pairs)',
    'true if possible to finish all courses, false otherwise',
    '1 ≤ numCourses ≤ 2000\n0 ≤ prerequisites.length ≤ 5000\nprerequisites[i].length == 2\n0 ≤ ai, bi < numCourses',
    'Input: numCourses = 2, prerequisites = [[1,0]]\nOutput: true\nExplanation: Take course 0, then course 1\n\nInput: numCourses = 2, prerequisites = [[1,0],[0,1]]\nOutput: false',
    'This is cycle detection in directed graph. Use DFS with three states or topological sort.',
    'Cycle Detection: DFS with visited states or Kahn''s algorithm',
    'O(V + E)',
    'O(V + E)',
    'graph,dfs,topological-sort,cycle-detection,medium',
    NOW()
);

-- ================================================================
-- DYNAMIC PROGRAMMING PROBLEMS
-- ================================================================

-- Climbing Stairs (Easy)
INSERT INTO problems (topic_id, subtopic_id, title, description, difficulty, problem_statement, input_format, output_format, constraints, examples, hints, solution_approach, time_complexity, space_complexity, tags, created_at) 
VALUES (
    (SELECT id FROM topics WHERE name = 'Dynamic Programming'),
    (SELECT id FROM subtopics WHERE name = 'Basic DP Concepts'),
    'Climbing Stairs',
    'Find number of ways to climb stairs taking 1 or 2 steps at a time.',
    'Easy',
    'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    'Single integer n (number of steps)',
    'Single integer representing number of ways',
    '1 ≤ n ≤ 45',
    'Input: n = 2\nOutput: 2\nExplanation: 1+1, 2\n\nInput: n = 3\nOutput: 3\nExplanation: 1+1+1, 1+2, 2+1',
    'This is Fibonacci sequence! ways(n) = ways(n-1) + ways(n-2)',
    'Dynamic Programming: dp[i] = dp[i-1] + dp[i-2]',
    'O(n)',
    'O(1) optimized',
    'dynamic-programming,fibonacci,easy',
    NOW()
);

-- House Robber (Medium)
INSERT INTO problems (topic_id, subtopic_id, title, description, difficulty, problem_statement, input_format, output_format, constraints, examples, hints, solution_approach, time_complexity, space_complexity, tags, created_at) 
VALUES (
    (SELECT id FROM topics WHERE name = 'Dynamic Programming'),
    (SELECT id FROM subtopics WHERE name = 'Linear DP'),
    'House Robber',
    'Rob houses to maximize money without robbing adjacent houses.',
    'Medium',
    'You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. The only constraint is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night. Given an integer array nums representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.',
    'First line: n (number of houses)\nSecond line: n integers (money in each house)',
    'Single integer representing maximum money that can be robbed',
    '1 ≤ nums.length ≤ 100\n0 ≤ nums[i] ≤ 400',
    'Input: nums = [1,2,3,1]\nOutput: 4\nExplanation: Rob house 1 (money = 1) and house 3 (money = 3). Total = 4\n\nInput: nums = [2,7,9,3,1]\nOutput: 12\nExplanation: Rob house 1, 3, and 5. Total = 12',
    'For each house, decide: rob this house + money from house i-2, or skip this house and take money from house i-1.',
    'DP: max(nums[i] + dp[i-2], dp[i-1])',
    'O(n)',
    'O(1) optimized',
    'dynamic-programming,array,medium',
    NOW()
);

-- Longest Increasing Subsequence (Medium)
INSERT INTO problems (topic_id, subtopic_id, title, description, difficulty, problem_statement, input_format, output_format, constraints, examples, hints, solution_approach, time_complexity, space_complexity, tags, created_at) 
VALUES (
    (SELECT id FROM topics WHERE name = 'Dynamic Programming'),
    (SELECT id FROM subtopics WHERE name = 'Subsequence DP'),
    'Longest Increasing Subsequence',
    'Find length of longest strictly increasing subsequence.',
    'Medium',
    'Given an integer array nums, return the length of the longest strictly increasing subsequence.',
    'First line: n (length of array)\nSecond line: n integers',
    'Single integer representing length of LIS',
    '1 ≤ nums.length ≤ 2500\n-10^4 ≤ nums[i] ≤ 10^4',
    'Input: nums = [10,9,2,5,3,7,101,18]\nOutput: 4\nExplanation: LIS is [2,3,7,101], length = 4\n\nInput: nums = [0,1,0,3,2,3]\nOutput: 4',
    'DP approach: dp[i] = length of LIS ending at i. Binary search optimization possible.',
    'DP: For each element, find max LIS length from previous smaller elements',
    'O(n²) DP, O(n log n) with binary search',
    'O(n)',
    'dynamic-programming,binary-search,subsequence,medium',
    NOW()
);

-- ================================================================
-- HASH TABLE PROBLEMS
-- ================================================================

-- Group Anagrams (Medium)
INSERT INTO problems (topic_id, subtopic_id, title, description, difficulty, problem_statement, input_format, output_format, constraints, examples, hints, solution_approach, time_complexity, space_complexity, tags, created_at) 
VALUES (
    (SELECT id FROM topics WHERE name = 'Hash Tables and Maps'),
    (SELECT id FROM subtopics WHERE name = 'Hash Map Applications'),
    'Group Anagrams',
    'Group strings that are anagrams of each other.',
    'Medium',
    'Given an array of strings strs, group the anagrams together. You can return the answer in any order. An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.',
    'First line: n (number of strings)\nNext n lines: strings',
    'Groups of anagrams, each group on separate lines',
    '1 ≤ strs.length ≤ 10^4\n0 ≤ strs[i].length ≤ 100\nstrs[i] consists of lowercase English letters',
    'Input: strs = ["eat","tea","tan","ate","nat","bat"]\nOutput: [["bat"],["nat","tan"],["ate","eat","tea"]]\n\nInput: strs = [""]\nOutput: [[""]]',
    'Use sorted string as key in hash map, or use character frequency as key.',
    'HashMap: Use sorted string or character frequency as key',
    'O(n × k log k) where k is max length',
    'O(n × k)',
    'hash-table,string,sorting,medium',
    NOW()
);

-- Top K Frequent Elements (Medium)
INSERT INTO problems (topic_id, subtopic_id, title, description, difficulty, problem_statement, input_format, output_format, constraints, examples, hints, solution_approach, time_complexity, space_complexity, tags, created_at) 
VALUES (
    (SELECT id FROM topics WHERE name = 'Hash Tables and Maps'),
    (SELECT id FROM subtopics WHERE name = 'Frequency Counting'),
    'Top K Frequent Elements',
    'Find k most frequent elements in array using hash map and heap.',
    'Medium',
    'Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.',
    'First line: n (array length)\nSecond line: n integers\nThird line: k',
    'k integers representing most frequent elements',
    '1 ≤ nums.length ≤ 10^5\nk is in range [1, number of unique elements]\nIt is guaranteed that the answer is unique',
    'Input: nums = [1,1,1,2,2,3], k = 2\nOutput: [1,2]\n\nInput: nums = [1], k = 1\nOutput: [1]',
    'Count frequencies with hash map, then use min-heap of size k or bucket sort.',
    'HashMap + Heap: Count frequencies, maintain heap of k elements',
    'O(n log k)',
    'O(n)',
    'hash-table,heap,bucket-sort,medium',
    NOW()
);

-- ================================================================
-- BACKTRACKING PROBLEMS
-- ================================================================

-- Generate Parentheses (Medium)
INSERT INTO problems (topic_id, subtopic_id, title, description, difficulty, problem_statement, input_format, output_format, constraints, examples, hints, solution_approach, time_complexity, space_complexity, tags, created_at) 
VALUES (
    (SELECT id FROM topics WHERE name = 'Backtracking'),
    (SELECT id FROM subtopics WHERE name = 'Combination Generation'),
    'Generate Parentheses',
    'Generate all combinations of well-formed parentheses.',
    'Medium',
    'Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.',
    'Single integer n (number of pairs)',
    'Each valid combination on a new line',
    '1 ≤ n ≤ 8',
    'Input: n = 3\nOutput: ["((()))","(()())","(())()","()(())","()()()"]\n\nInput: n = 1\nOutput: ["()"]',
    'Use backtracking. At each step, add ''('' if open < n, add '')'' if close < open.',
    'Backtracking: Track open and close parentheses count',
    'O(4^n / √n) Catalan number',
    'O(4^n / √n)',
    'backtracking,string,recursion,medium',
    NOW()
);

-- Word Search (Medium)
INSERT INTO problems (topic_id, subtopic_id, title, description, difficulty, problem_statement, input_format, output_format, constraints, examples, hints, solution_approach, time_complexity, space_complexity, tags, created_at) 
VALUES (
    (SELECT id FROM topics WHERE name = 'Backtracking'),
    (SELECT id FROM subtopics WHERE name = 'Grid Search'),
    'Word Search',
    'Search for word in 2D grid using backtracking.',
    'Medium',
    'Given an m x n grid of characters board and a string word, return true if word exists in the grid. The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.',
    'First line: m n (grid dimensions)\nNext m lines: n characters\nLast line: word to search',
    'true if word exists, false otherwise',
    '1 ≤ m, n ≤ 6\n1 ≤ word.length ≤ 15\nboard and word consist of only lowercase and uppercase English letters',
    'Input:\nboard = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"\nOutput: true\n\nInput:\nboard = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "SEE"\nOutput: true',
    'For each cell, try to match word starting from that cell using DFS with backtracking.',
    'DFS + Backtracking: Try all paths, mark visited, backtrack',
    'O(m × n × 4^L) where L is word length',
    'O(L)',
    'backtracking,dfs,grid,string,medium',
    NOW()
);

-- ================================================================
-- SORTING AND SEARCHING PROBLEMS
-- ================================================================

-- Binary Search (Easy)
INSERT INTO problems (topic_id, subtopic_id, title, description, difficulty, problem_statement, input_format, output_format, constraints, examples, hints, solution_approach, time_complexity, space_complexity, tags, created_at) 
VALUES (
    (SELECT id FROM topics WHERE name = 'Sorting and Searching'),
    (SELECT id FROM subtopics WHERE name = 'Binary Search'),
    'Binary Search',
    'Search for target value in sorted array using binary search.',
    'Easy',
    'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.',
    'First line: n (array length)\nSecond line: n sorted integers\nThird line: target value',
    'Index of target if found, -1 otherwise',
    '1 ≤ nums.length ≤ 10^4\n-10^4 < nums[i], target < 10^4\nAll integers in nums are unique\nnums is sorted in ascending order',
    'Input: nums = [-1,0,3,5,9,12], target = 9\nOutput: 4\n\nInput: nums = [-1,0,3,5,9,12], target = 2\nOutput: -1',
    'Use left and right pointers. Compare middle element with target and adjust pointers.',
    'Binary Search: Divide search space in half each iteration',
    'O(log n)',
    'O(1)',
    'binary-search,array,easy',
    NOW()
);

-- Search in Rotated Sorted Array (Medium)
INSERT INTO problems (topic_id, subtopic_id, title, description, difficulty, problem_statement, input_format, output_format, constraints, examples, hints, solution_approach, time_complexity, space_complexity, tags, created_at) 
VALUES (
    (SELECT id FROM topics WHERE name = 'Sorting and Searching'),
    (SELECT id FROM subtopics WHERE name = 'Modified Binary Search'),
    'Search in Rotated Sorted Array',
    'Search target in rotated sorted array using modified binary search.',
    'Medium',
    'There is an integer array nums sorted in ascending order (with distinct values). Prior to being passed to your function, nums is possibly rotated at an unknown pivot index k. Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.',
    'First line: n (array length)\nSecond line: n integers (rotated sorted array)\nThird line: target value',
    'Index of target if found, -1 otherwise',
    '1 ≤ nums.length ≤ 5000\n-10^4 ≤ nums[i] ≤ 10^4\nAll values of nums are unique\nnums is guaranteed to be rotated at some pivot',
    'Input: nums = [4,5,6,7,0,1,2], target = 0\nOutput: 4\n\nInput: nums = [4,5,6,7,0,1,2], target = 3\nOutput: -1',
    'One half is always sorted. Check which half is sorted and if target lies in that range.',
    'Modified Binary Search: Check sorted half and target range',
    'O(log n)',
    'O(1)',
    'binary-search,array,rotation,medium',
    NOW()
);

-- Merge Intervals (Medium)
INSERT INTO problems (topic_id, subtopic_id, title, description, difficulty, problem_statement, input_format, output_format, constraints, examples, hints, solution_approach, time_complexity, space_complexity, tags, created_at) 
VALUES (
    (SELECT id FROM topics WHERE name = 'Sorting and Searching'),
    (SELECT id FROM subtopics WHERE name = 'Interval Problems'),
    'Merge Intervals',
    'Merge overlapping intervals in array of intervals.',
    'Medium',
    'Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
    'First line: n (number of intervals)\nNext n lines: start_i end_i',
    'Merged intervals, each on new line',
    '1 ≤ intervals.length ≤ 10^4\n0 ≤ starti ≤ endi ≤ 10^4',
    'Input: intervals = [[1,3],[2,6],[8,10],[15,18]]\nOutput: [[1,6],[8,10],[15,18]]\nExplanation: [1,3] and [2,6] overlap\n\nInput: intervals = [[1,4],[4,5]]\nOutput: [[1,5]]',
    'Sort intervals by start time. Merge overlapping intervals by comparing end times.',
    'Sort + Greedy: Sort by start, merge if current start ≤ previous end',
    'O(n log n)',
    'O(1) excluding output',
    'sorting,intervals,greedy,medium',
    NOW()
);

-- ================================================================
-- UPDATE TOPICS WITH ACTUAL PROBLEM COUNTS
-- ================================================================

-- Update Arrays and Strings topic
UPDATE topics SET total_problems = (
    SELECT COUNT(*) FROM problems WHERE topic_id = (SELECT id FROM topics WHERE name = 'Arrays and Strings')
) WHERE name = 'Arrays and Strings';

-- Update Linked Lists topic  
UPDATE topics SET total_problems = (
    SELECT COUNT(*) FROM problems WHERE topic_id = (SELECT id FROM topics WHERE name = 'Linked Lists')
) WHERE name = 'Linked Lists';

-- Update Stacks and Queues topic
UPDATE topics SET total_problems = (
    SELECT COUNT(*) FROM problems WHERE topic_id = (SELECT id FROM topics WHERE name = 'Stacks and Queues')
) WHERE name = 'Stacks and Queues';

-- Update Trees and Graphs topic
UPDATE topics SET total_problems = (
    SELECT COUNT(*) FROM problems WHERE topic_id = (SELECT id FROM topics WHERE name = 'Trees and Graphs')
) WHERE name = 'Trees and Graphs';

-- Update Dynamic Programming topic
UPDATE topics SET total_problems = (
    SELECT COUNT(*) FROM problems WHERE topic_id = (SELECT id FROM topics WHERE name = 'Dynamic Programming')
) WHERE name = 'Dynamic Programming';

-- Update Hash Tables and Maps topic
UPDATE topics SET total_problems = (
    SELECT COUNT(*) FROM problems WHERE topic_id = (SELECT id FROM topics WHERE name = 'Hash Tables and Maps')
) WHERE name = 'Hash Tables and Maps';

-- Update Backtracking topic
UPDATE topics SET total_problems = (
    SELECT COUNT(*) FROM problems WHERE topic_id = (SELECT id FROM topics WHERE name = 'Backtracking')
) WHERE name = 'Backtracking';

-- Update Sorting and Searching topic
UPDATE topics SET total_problems = (
    SELECT COUNT(*) FROM problems WHERE topic_id = (SELECT id FROM topics WHERE name = 'Sorting and Searching')
) WHERE name = 'Sorting and Searching';

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Verify data insertion
SELECT 'Problem insertion completed. Summary:' as status;

SELECT 
    t.name as topic_name,
    COUNT(p.id) as total_problems,
    SUM(CASE WHEN p.difficulty = 'Easy' THEN 1 ELSE 0 END) as easy_problems,
    SUM(CASE WHEN p.difficulty = 'Medium' THEN 1 ELSE 0 END) as medium_problems,
    SUM(CASE WHEN p.difficulty = 'Hard' THEN 1 ELSE 0 END) as hard_problems
FROM topics t
LEFT JOIN problems p ON t.id = p.topic_id
WHERE t.is_active = TRUE
GROUP BY t.id, t.name
ORDER BY t.sort_order;

SELECT 
    'Total problems inserted:' as metric,
    COUNT(*) as count
FROM problems;

COMMIT;
