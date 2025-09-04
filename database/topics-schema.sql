-- =============================================
-- LoopWar Topics Database Schema
-- =============================================

-- Categories table (DSA, Databases, etc.)
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Topics table (Array, String, etc.)
CREATE TABLE IF NOT EXISTS topics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    total_problems INT DEFAULT 0,
    difficulty_level ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_topic_per_category (category_id, name)
);

-- Subtopics table (Two Pointers, Sliding Window, etc.)
CREATE TABLE IF NOT EXISTS subtopics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    topic_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    UNIQUE KEY unique_subtopic_per_topic (topic_id, name)
);

-- Problems table (individual coding problems)
CREATE TABLE IF NOT EXISTS problems (
    id INT PRIMARY KEY AUTO_INCREMENT,
    topic_id INT NOT NULL,
    subtopic_id INT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL,
    solution_hints TEXT,
    time_complexity VARCHAR(50),
    space_complexity VARCHAR(50),
    tags JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    FOREIGN KEY (subtopic_id) REFERENCES subtopics(id) ON DELETE SET NULL
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    problem_id INT NOT NULL,
    status ENUM('not_started', 'in_progress', 'completed', 'skipped') DEFAULT 'not_started',
    attempts INT DEFAULT 0,
    best_time_ms INT,
    last_attempted_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_problem (user_id, problem_id)
);

-- Indexes for better performance
CREATE INDEX idx_topics_category ON topics(category_id);
CREATE INDEX idx_subtopics_topic ON subtopics(topic_id);
CREATE INDEX idx_problems_topic ON problems(topic_id);
CREATE INDEX idx_problems_subtopic ON problems(subtopic_id);
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_problem ON user_progress(problem_id);
