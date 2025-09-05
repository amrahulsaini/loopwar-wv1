-- ================================
-- LOOPAI ENHANCED FEATURES TABLES
-- ================================

-- AI Chat Sessions (for persistent chat history)
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_name VARCHAR(255) DEFAULT 'New Chat',
    problem_id INT NULL,
    category_id INT NULL,
    topic_id INT NULL,
    subtopic_id INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL,
    FOREIGN KEY (subtopic_id) REFERENCES subtopics(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_problem_id (problem_id),
    INDEX idx_is_active (is_active),
    INDEX idx_last_message_at (last_message_at)
);

-- AI Chat Messages (enhanced with message types)
CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    user_id INT NOT NULL,
    message_type ENUM('user_text', 'user_yes', 'user_no', 'ai_response', 'ai_question', 'system') DEFAULT 'user_text',
    content TEXT NOT NULL,
    metadata JSON NULL COMMENT 'Additional data like button clicks, code snippets, etc.',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_id (session_id),
    INDEX idx_user_id (user_id),
    INDEX idx_message_type (message_type),
    INDEX idx_created_at (created_at)
);

-- AI Generated Notes
CREATE TABLE IF NOT EXISTS ai_generated_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_id INT NULL,
    problem_id INT NULL,
    note_title VARCHAR(255) NOT NULL,
    note_content TEXT NOT NULL,
    note_type ENUM('concept_explanation', 'code_example', 'algorithm_summary', 'problem_solution', 'study_guide') DEFAULT 'concept_explanation',
    is_auto_generated BOOLEAN DEFAULT TRUE,
    is_edited BOOLEAN DEFAULT FALSE,
    tags JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES ai_chat_sessions(id) ON DELETE SET NULL,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_problem_id (problem_id),
    INDEX idx_note_type (note_type),
    INDEX idx_created_at (created_at)
);

-- AI Study Recommendations
CREATE TABLE IF NOT EXISTS ai_study_recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    current_problem_id INT NULL,
    recommended_problem_id INT NOT NULL,
    recommendation_reason TEXT NOT NULL,
    difficulty_match BOOLEAN DEFAULT FALSE,
    concept_match BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (current_problem_id) REFERENCES problems(id) ON DELETE SET NULL,
    FOREIGN KEY (recommended_problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_current_problem (current_problem_id),
    INDEX idx_recommended_problem (recommended_problem_id)
);

-- AI User Preferences (enhanced)
CREATE TABLE IF NOT EXISTS ai_user_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_setting (user_id, setting_key),
    INDEX idx_user_id (user_id),
    INDEX idx_setting_key (setting_key)
);

-- Insert default AI settings for existing users
INSERT IGNORE INTO ai_user_settings (user_id, setting_key, setting_value)
SELECT
    u.id,
    'chat_persistence',
    'true'
FROM users u;

INSERT IGNORE INTO ai_user_settings (user_id, setting_key, setting_value)
SELECT
    u.id,
    'auto_generate_notes',
    'true'
FROM users u;

INSERT IGNORE INTO ai_user_settings (user_id, setting_key, setting_value)
SELECT
    u.id,
    'study_recommendations',
    'true'
FROM users u;

-- ================================
-- USEFUL QUERIES
-- ================================

-- Get user's active chat sessions
-- SELECT * FROM ai_chat_sessions WHERE user_id = ? AND is_active = TRUE ORDER BY last_message_at DESC;

-- Get chat messages for a session
-- SELECT * FROM ai_chat_messages WHERE session_id = ? ORDER BY created_at ASC;

-- Get user's generated notes
-- SELECT * FROM ai_generated_notes WHERE user_id = ? ORDER BY updated_at DESC;

-- Get study recommendations for a user
-- SELECT r.*, p.title, p.difficulty FROM ai_study_recommendations r JOIN problems p ON r.recommended_problem_id = p.id WHERE r.user_id = ? ORDER BY r.created_at DESC;

-- Clean up old chat sessions (keep last 50 per user)
-- DELETE cs FROM ai_chat_sessions cs WHERE cs.id NOT IN (SELECT id FROM (SELECT id FROM ai_chat_sessions WHERE user_id = cs.user_id ORDER BY last_message_at DESC LIMIT 50) temp) AND cs.user_id = cs.user_id;</content>
<parameter name="filePath">c:\Users\ammra\Downloads\loopwar-wv1\database\loopai-enhanced-tables.sql
