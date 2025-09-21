-- Add new features to code_problems table
-- For submit functionality, rating system, and public sharing

-- Add columns for new features
ALTER TABLE code_problems 
ADD COLUMN is_submitted BOOLEAN DEFAULT FALSE COMMENT 'Whether the problem has been submitted by user',
ADD COLUMN rating DECIMAL(3,1) DEFAULT NULL COMMENT 'User rating out of 10.0',
ADD COLUMN rating_count INT DEFAULT 0 COMMENT 'Number of users who rated this problem',
ADD COLUMN total_rating_points DECIMAL(10,1) DEFAULT 0 COMMENT 'Sum of all ratings for calculating average',
ADD COLUMN is_public BOOLEAN DEFAULT FALSE COMMENT 'Whether problem is available to community',
ADD COLUMN submission_count INT DEFAULT 0 COMMENT 'Number of times this problem was submitted';

-- Add indexes for performance
ALTER TABLE code_problems
ADD INDEX idx_public_problems (is_public, rating, created_at),
ADD INDEX idx_user_submissions (user_id, is_submitted),
ADD INDEX idx_rating (rating, rating_count);

-- Create table for individual problem ratings
CREATE TABLE IF NOT EXISTS problem_ratings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    problem_id INT NOT NULL,
    user_id INT NOT NULL,
    rating DECIMAL(3,1) NOT NULL CHECK (rating >= 0 AND rating <= 10),
    comment TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_problem_rating (user_id, problem_id),
    FOREIGN KEY (problem_id) REFERENCES code_problems(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_problem_ratings (problem_id, rating),
    INDEX idx_user_ratings (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Update existing problems to allow public sharing for AI-generated ones
UPDATE code_problems 
SET is_public = TRUE 
WHERE is_ai_generated = TRUE AND user_id IS NOT NULL;