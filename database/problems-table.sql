-- Create problems table for storing DSA problems
CREATE TABLE IF NOT EXISTS problems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    topic_id INT NOT NULL,
    subtopic_id INT NOT NULL,
    problem_name VARCHAR(255) NOT NULL,
    problem_description TEXT NOT NULL,
    difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Easy',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'admin',
    status ENUM('active', 'inactive') DEFAULT 'active',
    
    -- Foreign key constraints
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    FOREIGN KEY (subtopic_id) REFERENCES subtopics(id) ON DELETE CASCADE,
    
    -- Indexes for better performance
    INDEX idx_category_topic_subtopic (category_id, topic_id, subtopic_id),
    INDEX idx_difficulty (difficulty),
    INDEX idx_status (status)
);

-- Update subtopics table to track total problems count
ALTER TABLE subtopics 
ADD COLUMN IF NOT EXISTS total_problems INT DEFAULT 0;

-- Create a trigger to automatically update total_problems count
DELIMITER //
CREATE TRIGGER update_subtopic_problems_count 
AFTER INSERT ON problems
FOR EACH ROW
BEGIN
    UPDATE subtopics 
    SET total_problems = (
        SELECT COUNT(*) 
        FROM problems 
        WHERE subtopic_id = NEW.subtopic_id 
        AND status = 'active'
    )
    WHERE id = NEW.subtopic_id;
END//

CREATE TRIGGER update_subtopic_problems_count_delete
AFTER DELETE ON problems
FOR EACH ROW
BEGIN
    UPDATE subtopics 
    SET total_problems = (
        SELECT COUNT(*) 
        FROM problems 
        WHERE subtopic_id = OLD.subtopic_id 
        AND status = 'active'
    )
    WHERE id = OLD.subtopic_id;
END//

CREATE TRIGGER update_subtopic_problems_count_update
AFTER UPDATE ON problems
FOR EACH ROW
BEGIN
    -- Update count for old subtopic if changed
    IF OLD.subtopic_id != NEW.subtopic_id THEN
        UPDATE subtopics 
        SET total_problems = (
            SELECT COUNT(*) 
            FROM problems 
            WHERE subtopic_id = OLD.subtopic_id 
            AND status = 'active'
        )
        WHERE id = OLD.subtopic_id;
    END IF;
    
    -- Update count for new/current subtopic
    UPDATE subtopics 
    SET total_problems = (
        SELECT COUNT(*) 
        FROM problems 
        WHERE subtopic_id = NEW.subtopic_id 
        AND status = 'active'
    )
    WHERE id = NEW.subtopic_id;
END//
DELIMITER ;

-- Insert some sample problems for testing
INSERT INTO problems (category_id, topic_id, subtopic_id, problem_name, problem_description, difficulty) VALUES
(1, 1, 1, 'Two Sum', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', 'Easy'),
(1, 1, 1, 'Three Sum', 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.', 'Medium'),
(1, 1, 1, 'Four Sum', 'Given an array nums of n integers, return an array of all the unique quadruplets [nums[a], nums[b], nums[c], nums[d]] such that nums[a] + nums[b] + nums[c] + nums[d] == target.', 'Hard');
