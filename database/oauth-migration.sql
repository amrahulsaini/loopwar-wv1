-- ================================
-- OAUTH MIGRATION SCRIPT
-- Add OAuth support to existing users table
-- ================================

-- Add OAuth provider fields to users table
ALTER TABLE users 
ADD COLUMN oauth_provider VARCHAR(50) NULL AFTER profile_picture,
ADD COLUMN oauth_id VARCHAR(255) NULL AFTER oauth_provider;

-- Add indexes for better performance
ALTER TABLE users 
ADD INDEX idx_oauth_provider (oauth_provider),
ADD INDEX idx_oauth_id (oauth_id);

-- Verify the changes
DESCRIBE users;

-- Show confirmation message
SELECT 'OAuth columns successfully added to users table!' AS status;
