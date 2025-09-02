-- ================================
-- LOOPWAR DATABASE SCHEMA
-- ================================

-- Create database (run this first)
CREATE DATABASE IF NOT EXISTS loop_wv1 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE loop_wv1;

-- ================================
-- USERS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(6) NULL,
    verification_code_expires DATETIME NULL,
    session_token VARCHAR(255) NULL,
    session_expires DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    profile_picture VARCHAR(255) NULL,
    bio TEXT NULL,
    theme_preference ENUM('light', 'dark', 'auto') DEFAULT 'auto',
    notification_preferences JSON DEFAULT '{"email": true, "push": true}',
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_session_token (session_token),
    INDEX idx_verification_code (verification_code)
);

-- ================================
-- USER SESSIONS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_token (session_token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);

-- ================================
-- VERIFICATION CODES TABLE
-- ================================
CREATE TABLE IF NOT EXISTS verification_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    code VARCHAR(6) NOT NULL,
    type ENUM('email_verification', 'password_reset', '2fa') NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at TIMESTAMP NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 5,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_code (code),
    INDEX idx_expires_at (expires_at),
    INDEX idx_type (type)
);

-- ================================
-- USER ACTIVITIES LOG
-- ================================
CREATE TABLE IF NOT EXISTS user_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_type ENUM('login', 'logout', 'register', 'verify_email', 'password_change', 'profile_update') NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at)
);

-- ================================
-- NOTIFICATIONS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(255) NULL,
    expires_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
);

-- ================================
-- SETTINGS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS settings (
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

-- ================================
-- EMAIL SENDER TABLE
-- ================================
CREATE TABLE IF NOT EXISTS email_sender (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    email_type ENUM('verification', 'welcome', 'password_reset', 'notification', 'marketing', 'security_alert') NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    email_content TEXT,
    status ENUM('pending', 'sent', 'delivered', 'failed', 'bounced') DEFAULT 'pending',
    sent_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    opened_at TIMESTAMP NULL,
    clicked_at TIMESTAMP NULL,
    error_message TEXT NULL,
    smtp_response TEXT NULL,
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    scheduled_for TIMESTAMP NULL,
    template_id VARCHAR(50) NULL,
    metadata JSON DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_email_type (email_type),
    INDEX idx_status (status),
    INDEX idx_sent_at (sent_at),
    INDEX idx_scheduled_for (scheduled_for),
    INDEX idx_recipient_email (recipient_email)
);

-- ================================
-- API SECURITY TABLE (Rate Limiting)
-- ================================
CREATE TABLE IF NOT EXISTS api_rate_limits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    request_count INT DEFAULT 1,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    blocked_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_ip_endpoint (ip_address, endpoint),
    INDEX idx_ip_address (ip_address),
    INDEX idx_endpoint (endpoint),
    INDEX idx_window_start (window_start),
    INDEX idx_blocked_until (blocked_until)
);

-- ================================
-- COOKIE CONSENTS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS cookie_consents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    ip_address VARCHAR(45),
    consent_given BOOLEAN NOT NULL,
    consent_types JSON DEFAULT '{"necessary": true, "analytics": false, "marketing": false}',
    action VARCHAR(50) DEFAULT 'unknown',
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_ip_address (ip_address),
    INDEX idx_created_at (created_at),
    INDEX idx_action (action)
);

-- ================================
-- INITIAL DATA INSERTS
-- ================================

-- Insert default system settings
INSERT IGNORE INTO settings (user_id, setting_key, setting_value) VALUES 
(0, 'app_version', '1.0.0'),
(0, 'maintenance_mode', 'false'),
(0, 'registration_enabled', 'true'),
(0, 'email_verification_required', 'true'),
(0, 'max_login_attempts', '5'),
(0, 'session_duration_hours', '24');

-- ================================
-- USEFUL QUERIES FOR DEVELOPMENT
-- ================================

-- View all users with their verification status
-- SELECT id, username, email, is_verified, created_at, last_login FROM users ORDER BY created_at DESC;

-- View active sessions
-- SELECT s.*, u.username FROM user_sessions s JOIN users u ON s.user_id = u.id WHERE s.is_active = TRUE AND s.expires_at > NOW();

-- View recent activities
-- SELECT a.*, u.username FROM user_activities a JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC LIMIT 20;

-- Clean up expired verification codes
-- DELETE FROM verification_codes WHERE expires_at < NOW() OR is_used = TRUE;

-- Clean up expired sessions
-- DELETE FROM user_sessions WHERE expires_at < NOW();

-- User stats
-- SELECT 
--     COUNT(*) as total_users,
--     SUM(CASE WHEN is_verified = TRUE THEN 1 ELSE 0 END) as verified_users,
--     SUM(CASE WHEN last_login > DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as active_weekly
-- FROM users;
