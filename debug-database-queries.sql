-- Query to check test cases in database
-- Run this in your MySQL database to see what's actually stored

-- Check existing code problems and their test cases
SELECT 
    id,
    title,
    difficulty,
    category,
    topic,
    subtopic,
    sort_order,
    LENGTH(test_cases) as test_cases_length,
    JSON_VALID(test_cases) as test_cases_valid,
    JSON_LENGTH(test_cases) as test_cases_count,
    SUBSTRING(test_cases, 1, 200) as test_cases_preview,
    is_ai_generated,
    user_id,
    created_at
FROM code_problems 
ORDER BY created_at DESC 
LIMIT 10;

-- Check specific test case content
SELECT 
    id,
    title,
    test_cases
FROM code_problems 
WHERE category = 'dsa' 
  AND topic = 'arrays-hashing' 
  AND subtopic = 'two-pointers'
  AND sort_order = 1;

-- Check if test_cases are properly formatted JSON
SELECT 
    id,
    title,
    JSON_PRETTY(test_cases) as formatted_test_cases
FROM code_problems 
WHERE test_cases IS NOT NULL 
  AND test_cases != ''
  AND JSON_VALID(test_cases) = 1
LIMIT 5;