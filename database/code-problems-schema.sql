-- Code Problems and Submissions Schema for LoopWar

-- Code Problems Table - Updated to allow multiple problems per location
CREATE TABLE IF NOT EXISTS code_problems (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL DEFAULT 'Medium',
    category VARCHAR(100) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    subtopic VARCHAR(100) NOT NULL,
    sort_order INT NOT NULL,
    constraints TEXT,
    examples TEXT,
    hints JSON,
    time_complexity VARCHAR(500),
    space_complexity VARCHAR(500),
    test_cases JSON NOT NULL,
    function_templates JSON COMMENT 'JSON object containing function templates for each supported language (javascript, python, java, cpp, c, csharp, go, rust, php, ruby)',
    is_ai_generated BOOLEAN DEFAULT TRUE,
    user_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- REMOVED: UNIQUE KEY unique_location (category, topic, subtopic, sort_order), 
    -- Now multiple problems can exist for the same location
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_problems (user_id, created_at),
    INDEX idx_location_latest (category, topic, subtopic, sort_order, created_at DESC),
    INDEX idx_title_location (category, topic, subtopic, title, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Code Submissions Table
CREATE TABLE IF NOT EXISTS code_submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    problem_id INT NOT NULL,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    status ENUM('Pending', 'Running', 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Memory Limit Exceeded', 'Runtime Error', 'Compilation Error') DEFAULT 'Pending',
    test_results JSON,
    execution_time DECIMAL(10,3),
    memory_used INT,
    total_test_cases INT DEFAULT 0,
    passed_test_cases INT DEFAULT 0,
    category VARCHAR(100) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    subtopic VARCHAR(100) NOT NULL,
    sort_order INT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (problem_id) REFERENCES code_problems(id) ON DELETE CASCADE,
    INDEX idx_user_submissions (user_id, submitted_at),
    INDEX idx_problem_submissions (problem_id, status),
    INDEX idx_location_submissions (category, topic, subtopic, sort_order)
);

-- User Code Progress Table
CREATE TABLE IF NOT EXISTS user_code_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    problem_id INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    subtopic VARCHAR(100) NOT NULL,
    sort_order INT NOT NULL,
    is_solved BOOLEAN DEFAULT FALSE,
    best_submission_id INT,
    attempts_count INT DEFAULT 0,
    first_solved_at TIMESTAMP NULL,
    last_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_problem (user_id, problem_id),
    FOREIGN KEY (best_submission_id) REFERENCES code_submissions(id) ON DELETE SET NULL,
    INDEX idx_user_progress (user_id, category, topic, subtopic),
    INDEX idx_problem_progress (problem_id, is_solved)
);
