-- Quiz system database schema

-- Main quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  topic VARCHAR(100) NOT NULL,
  subtopic VARCHAR(100) NOT NULL,
  sort_order INT NOT NULL,
  total_points INT DEFAULT 0,
  time_limit INT DEFAULT 30, -- in minutes
  attempts INT DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0.00,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_quiz (category, topic, subtopic, sort_order),
  INDEX idx_category_topic (category, topic, subtopic),
  INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quiz questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quiz_id INT NOT NULL,
  question_type ENUM('mcq', 'true_false', 'logical_thinking', 'fill_blanks') NOT NULL,
  question_text TEXT NOT NULL,
  options JSON, -- For MCQ options
  correct_answer TEXT NOT NULL,
  correct_answer_type ENUM('string', 'boolean', 'json') DEFAULT 'string',
  explanation TEXT,
  difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
  points INT DEFAULT 1,
  question_order INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  INDEX idx_quiz_order (quiz_id, question_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quiz results table (for storing user quiz attempts)
CREATE TABLE IF NOT EXISTS quiz_results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quiz_id INT NOT NULL,
  user_id VARCHAR(255) NOT NULL, -- Can be email, user ID, or 'guest'
  score INT NOT NULL,
  total_questions INT NOT NULL,
  correct_answers INT NOT NULL,
  time_spent INT, -- in seconds
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  INDEX idx_quiz_user (quiz_id, user_id),
  INDEX idx_user_results (user_id, completed_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Individual user answers table
CREATE TABLE IF NOT EXISTS quiz_user_answers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  result_id INT NOT NULL,
  question_id INT NOT NULL,
  user_answer TEXT,
  is_correct BOOLEAN NOT NULL,
  time_taken INT DEFAULT 0, -- in milliseconds
  
  FOREIGN KEY (result_id) REFERENCES quiz_results(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE,
  INDEX idx_result_question (result_id, question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quiz statistics view
CREATE OR REPLACE VIEW quiz_stats AS
SELECT 
  q.id,
  q.title,
  q.category,
  q.topic,
  q.subtopic,
  q.sort_order,
  q.total_points,
  q.attempts,
  q.average_score,
  q.is_ai_generated,
  COUNT(DISTINCT qr.id) as total_attempts,
  AVG(qr.score) as avg_score,
  MAX(qr.score) as max_score,
  MIN(qr.score) as min_score,
  COUNT(DISTINCT qr.user_id) as unique_users
FROM quizzes q
LEFT JOIN quiz_results qr ON q.id = qr.quiz_id
GROUP BY q.id;

-- Sample data insertion (optional)
-- Insert a sample quiz
INSERT IGNORE INTO quizzes 
(title, description, category, topic, subtopic, sort_order, total_points, time_limit, is_ai_generated) 
VALUES 
('JavaScript Basics Quiz', 'Test your knowledge of JavaScript fundamentals', 'programming', 'javascript', 'basics', 1, 10, 20, 0);

-- Get the quiz ID for sample questions
SET @quiz_id = LAST_INSERT_ID();

-- Insert sample questions (only if quiz was created)
INSERT IGNORE INTO quiz_questions 
(quiz_id, question_type, question_text, options, correct_answer, explanation, difficulty, points, question_order) 
VALUES 
(@quiz_id, 'mcq', 'What is the correct way to declare a variable in JavaScript?', 
 '["var name = value", "variable name = value", "v name = value", "declare name = value"]', 
 'var name = value', 'The var keyword is used to declare variables in JavaScript.', 'easy', 1, 1),

(@quiz_id, 'true_false', 'JavaScript is a statically typed language.', 
 NULL, 'false', 'JavaScript is dynamically typed, not statically typed.', 'easy', 1, 2),

(@quiz_id, 'mcq', 'Which of the following is NOT a JavaScript data type?', 
 '["String", "Boolean", "Integer", "Undefined"]', 
 'Integer', 'JavaScript has Number type, not Integer specifically.', 'medium', 2, 3);
