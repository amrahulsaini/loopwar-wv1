-- ================================
-- AI LEARNING WORKSPACE SCHEMA
-- ================================

-- ================================
-- LEARNING SESSIONS TABLE
-- Store individual learning sessions for problems
-- ================================
CREATE TABLE IF NOT EXISTS learning_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL, -- NULL for anonymous users
    problem_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    status ENUM('active', 'completed', 'paused') DEFAULT 'active',
    notes_content LONGTEXT DEFAULT '',
    total_messages INT DEFAULT 0,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_problem_id (problem_id),
    INDEX idx_session_token (session_token),
    INDEX idx_status (status),
    INDEX idx_last_activity (last_activity)
);

-- ================================
-- CONVERSATION MESSAGES TABLE
-- Store all AI conversations
-- ================================
CREATE TABLE IF NOT EXISTS conversation_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    message_type ENUM('user', 'ai', 'system') NOT NULL,
    content LONGTEXT NOT NULL,
    prompt_type VARCHAR(100) NULL, -- 'explain_concept', 'real_life_analogy', 'prerequisites', etc.
    ai_metadata JSON NULL, -- Store AI response metadata, tokens used, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES learning_sessions(id) ON DELETE CASCADE,
    
    INDEX idx_session_id (session_id),
    INDEX idx_message_type (message_type),
    INDEX idx_prompt_type (prompt_type),
    INDEX idx_created_at (created_at)
);

-- ================================
-- AI GENERATED NOTES TABLE
-- Store AI-generated notes and key concepts
-- ================================
CREATE TABLE IF NOT EXISTS ai_generated_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    note_type ENUM('definition', 'concept', 'example', 'prerequisite', 'summary') NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    order_index INT DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES learning_sessions(id) ON DELETE CASCADE,
    
    INDEX idx_session_id (session_id),
    INDEX idx_note_type (note_type),
    INDEX idx_order_index (order_index),
    INDEX idx_is_pinned (is_pinned)
);

-- ================================
-- LEARNING ANALYTICS TABLE
-- Track learning progress and patterns
-- ================================
CREATE TABLE IF NOT EXISTS learning_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    session_id INT NOT NULL,
    problem_id INT NOT NULL,
    time_spent_minutes INT DEFAULT 0,
    questions_asked INT DEFAULT 0,
    concepts_explained INT DEFAULT 0,
    prerequisites_reviewed INT DEFAULT 0,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    understanding_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (session_id) REFERENCES learning_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_problem_id (problem_id),
    INDEX idx_completion_percentage (completion_percentage)
);

-- ================================
-- DEFAULT AI PROMPTS TABLE
-- Store predefined prompt templates
-- ================================
CREATE TABLE IF NOT EXISTS ai_prompt_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prompt_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    template TEXT NOT NULL,
    description TEXT NULL,
    category VARCHAR(100) DEFAULT 'general',
    is_active BOOLEAN DEFAULT TRUE,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_prompt_type (prompt_type),
    INDEX idx_category (category),
    INDEX idx_is_active (is_active),
    INDEX idx_order_index (order_index)
);

-- ================================
-- INSERT DEFAULT PROMPT TEMPLATES
-- ================================
INSERT INTO ai_prompt_templates (prompt_type, title, template, description, category, order_index) VALUES
('explain_concept', 'Explain This Concept', 'Please explain the concept of "{concept}" in the context of "{problem_name}". Make it simple and easy to understand.', 'Get a clear explanation of the main concept', 'learning', 1),
('problem_meaning', 'What Does This Problem Mean?', 'Can you explain what the problem "{problem_name}" is asking for? Break it down in simple terms.', 'Understand the problem statement', 'learning', 2),
('real_life_analogy', 'Real Life Analogy', 'Can you give me a real-life analogy to understand "{concept}" better?', 'Learn through practical examples', 'learning', 3),
('prerequisites', 'Check Prerequisites', 'What concepts should I know before learning about "{concept}"? Are there any specific problems I should practice first?', 'Identify required knowledge', 'learning', 4),
('time_complexity', 'Time Complexity Explanation', 'Explain the time and space complexity of this approach. Why is it efficient or inefficient?', 'Understand algorithm efficiency', 'technical', 5),
('step_by_step', 'Step by Step Solution', 'Can you walk me through the solution step by step?', 'Get detailed solution breakdown', 'technical', 6),
('common_mistakes', 'Common Mistakes', 'What are the common mistakes students make while solving this type of problem?', 'Avoid typical pitfalls', 'tips', 7),
('practice_similar', 'Similar Problems', 'Can you suggest similar problems I should practice to master this concept?', 'Get practice recommendations', 'practice', 8);

-- ================================
-- LEARNING PATHS TABLE
-- Track recommended learning sequences
-- ================================
CREATE TABLE IF NOT EXISTS learning_paths (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    current_problem_id INT NOT NULL,
    recommended_problems JSON NOT NULL, -- Array of problem IDs
    prerequisites_completed JSON DEFAULT '[]',
    path_type ENUM('prerequisite', 'similar', 'advanced') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (current_problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_current_problem_id (current_problem_id),
    INDEX idx_path_type (path_type)
);

-- ================================
-- TRIGGERS FOR ANALYTICS
-- ================================

-- Update analytics on new conversation message
DELIMITER //
CREATE TRIGGER update_learning_analytics_on_message
AFTER INSERT ON conversation_messages
FOR EACH ROW
BEGIN
    IF NEW.message_type = 'user' THEN
        UPDATE learning_analytics 
        SET questions_asked = questions_asked + 1
        WHERE session_id = NEW.session_id;
    ELSEIF NEW.message_type = 'ai' AND NEW.prompt_type IS NOT NULL THEN
        UPDATE learning_analytics 
        SET concepts_explained = concepts_explained + 1
        WHERE session_id = NEW.session_id;
    END IF;
END//

-- Update session message count
CREATE TRIGGER update_session_message_count
AFTER INSERT ON conversation_messages
FOR EACH ROW
BEGIN
    UPDATE learning_sessions 
    SET total_messages = total_messages + 1
    WHERE id = NEW.session_id;
END//

DELIMITER ;
