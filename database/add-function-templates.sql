-- Add function templates column to code_problems table
-- This will store function-only templates for each supported language

ALTER TABLE code_problems 
ADD COLUMN function_templates JSON AFTER test_cases;

-- Update the comment for clarity
COMMENT ON COLUMN code_problems.function_templates IS 'JSON object containing function templates for each supported language (javascript, python, java, cpp, c, csharp, go, rust, php, ruby)';