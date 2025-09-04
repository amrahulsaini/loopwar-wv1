-- =============================================
-- INSERT ADDITIONAL CATEGORIES FOR LOOPWAR
-- Run this in phpMyAdmin or MySQL console
-- =============================================

-- Use your database
USE loop_wv1;

-- Insert additional categories with professional icons
INSERT INTO categories (name, icon, description, sort_order, is_active, created_at, updated_at) VALUES
('Databases', 'Database', 'SQL, NoSQL, database design, optimization, and data management', 2, TRUE, NOW(), NOW()),
('OS & Shell', 'Terminal', 'Operating systems, shell scripting, command line tools, and system administration', 3, TRUE, NOW(), NOW()),
('Networking & Concurrency', 'Network', 'Network protocols, distributed systems, multithreading, and concurrent programming', 4, TRUE, NOW(), NOW()),
('Programming Languages', 'Code2', 'Language-specific concepts, paradigms, and advanced programming techniques', 5, TRUE, NOW(), NOW()),
('Debugging & Optimization', 'Bug', 'Performance tuning, debugging techniques, profiling, and code optimization', 6, TRUE, NOW(), NOW()),
('System Design', 'Server', 'Scalable architecture, design patterns, microservices, and distributed systems', 7, TRUE, NOW(), NOW()),
('AI & ML', 'Bot', 'Machine learning algorithms, artificial intelligence, neural networks, and data science', 8, TRUE, NOW(), NOW());

-- Verify the insertion
SELECT 'Categories inserted successfully!' as Status;

-- Show all categories
SELECT 
    id,
    name,
    icon,
    description,
    sort_order,
    is_active
FROM categories 
ORDER BY sort_order;

-- Show category count
SELECT 
    'Total Categories' as Info,
    COUNT(*) as Count
FROM categories 
WHERE is_active = 1;
