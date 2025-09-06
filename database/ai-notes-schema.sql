-- AI Learning Notes Database Schema
CREATE TABLE IF NOT EXISTS ai_learning_notes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    subtopic VARCHAR(100) NOT NULL,
    sort_order INT NOT NULL,
    
    -- AI-generated content
    definitions JSON,
    analogies JSON,
    key_insights JSON,
    examples JSON,
    
    -- User-editable content
    personal_notes TEXT,
    user_highlights JSON,
    custom_tags JSON,
    
    -- Metadata
    conversation_context TEXT,
    last_ai_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_user_update TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for fast queries
    INDEX idx_user_location (user_id, category, topic, subtopic, sort_order),
    INDEX idx_user_id (user_id),
    INDEX idx_last_update (last_ai_update)
);

-- Add foreign key constraint to users table
-- ALTER TABLE ai_learning_notes ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
