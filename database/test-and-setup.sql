-- Quick Test and Setup Script for LoopWar DSA Database
-- Run this in your MySQL database

-- 1. First, verify your database exists
SHOW DATABASES LIKE 'loop_wv1';

-- 2. Use the database
USE loop_wv1;

-- 3. Check if tables exist
SHOW TABLES LIKE 'categories';
SHOW TABLES LIKE 'topics';
SHOW TABLES LIKE 'subtopics';

-- 4. If tables don't exist, create them:
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

-- 5. Insert Core DSA Category (if not exists)
INSERT IGNORE INTO categories (name, icon, description, sort_order) VALUES 
('Core DSA', 'Workflow', 'Fundamental Data Structures and Algorithms', 1);

-- 6. Check current data
SELECT 'Current Categories:' as Info;
SELECT * FROM categories;

SELECT 'Current Topics:' as Info;
SELECT * FROM topics;

SELECT 'Current Subtopics:' as Info;
SELECT * FROM subtopics;

-- 7. Ready message
SELECT '✅ Database setup complete! You can now run the main DSA update script.' as Status;
