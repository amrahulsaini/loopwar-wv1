import mysql from 'mysql2/promise';

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'wv1',
  password: process.env.DB_PASSWORD || 'wv1',
  database: process.env.DB_NAME || 'loop_wv1',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4'
};

// Create connection pool
let pool: mysql.Pool;

try {
  pool = mysql.createPool(dbConfig);
  console.log('✅ MySQL connection pool created successfully');
} catch (error) {
  console.error('❌ Failed to create MySQL connection pool:', error);
  throw error;
}

// Database utility functions
export class Database {
  static async query(sql: string, params?: unknown[]): Promise<unknown> {
    try {
      const [results] = await pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  static async queryOne(sql: string, params?: unknown[]): Promise<unknown> {
    try {
      const results = await this.query(sql, params);
      return Array.isArray(results) ? results[0] : null;
    } catch (error) {
      console.error('Database queryOne error:', error);
      throw error;
    }
  }

  static async transaction(callback: (connection: mysql.Connection) => Promise<unknown>): Promise<unknown> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // User-related database operations
  static async createUser(userData: {
    username: string;
    email: string;
    passwordHash: string;
    verificationCode: string;
  }) {
    const sql = `
      INSERT INTO users (username, email, password_hash, verification_code, verification_code_expires)
      VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))
    `;
    const params = [userData.username, userData.email, userData.passwordHash, userData.verificationCode];
    const result = await this.query(sql, params) as { insertId: number };
    return result.insertId;
  }

  static async findUserByEmail(email: string) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    return await this.queryOne(sql, [email]);
  }

  static async findUserByUsername(username: string) {
    const sql = 'SELECT * FROM users WHERE username = ?';
    return await this.queryOne(sql, [username]);
  }

  static async findUserByOAuth(provider: string, oauthId: string) {
    const sql = 'SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ?';
    return await this.queryOne(sql, [provider, oauthId]);
  }

  static async upsertOAuthUser(user: {
    provider: string;
    oauthId: string;
    email: string;
    username?: string;
    profilePicture?: string;
  }): Promise<unknown> {
    // Try find existing by oauth provider/id or email
    const existingByOauth = await this.findUserByOAuth(user.provider, user.oauthId);
    if (existingByOauth) return existingByOauth;

    const existingByEmail = await this.findUserByEmail(user.email);
    if (existingByEmail) {
      // Link oauth to existing account
      const existingUser = existingByEmail as { id: number };
      const sql = `UPDATE users SET oauth_provider = ?, oauth_id = ?, profile_picture = ? WHERE id = ?`;
      await this.query(sql, [user.provider, user.oauthId, user.profilePicture || null, existingUser.id]);
      return await this.findUserByEmail(user.email);
    }

    // Create new user
    const username = user.username || user.email.split('@')[0];
    const passwordHash = ''; // no password for oauth users
    const sql = `
      INSERT INTO users (username, email, password_hash, is_verified, oauth_provider, oauth_id, profile_picture)
      VALUES (?, ?, ?, TRUE, ?, ?, ?)
    `;
    const res = await this.query(sql, [username, user.email, passwordHash, user.provider, user.oauthId, user.profilePicture || null]) as { insertId: number };
    return await this.queryOne('SELECT * FROM users WHERE id = ?', [res.insertId]);
  }

  static async findUserBySessionToken(sessionToken: string) {
    const sql = `
      SELECT u.*, s.expires_at as session_expires 
      FROM users u 
      JOIN user_sessions s ON u.id = s.user_id 
      WHERE s.session_token = ? AND s.expires_at > NOW() AND s.is_active = TRUE
    `;
    return await this.queryOne(sql, [sessionToken]);
  }

  static async verifyUser(verificationCode: string) {
    const sql = `
      UPDATE users 
      SET is_verified = TRUE, verification_code = NULL, verification_code_expires = NULL 
      WHERE verification_code = ? AND verification_code_expires > NOW()
    `;
    const result = await this.query(sql, [verificationCode]) as { affectedRows: number };
    return result.affectedRows > 0;
  }

  static async createSession(userId: number, sessionToken: string, ipAddress?: string, userAgent?: string) {
    const sql = `
      INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, expires_at)
      VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))
    `;
    await this.query(sql, [userId, sessionToken, ipAddress || null, userAgent || null]);
  }

  static async invalidateSession(sessionToken: string) {
    const sql = 'UPDATE user_sessions SET is_active = FALSE WHERE session_token = ?';
    await this.query(sql, [sessionToken]);
  }

  static async logActivity(userId: number, activityType: string, ipAddress?: string, userAgent?: string, details?: Record<string, unknown>) {
    const sql = `
      INSERT INTO user_activities (user_id, activity_type, ip_address, user_agent, details)
      VALUES (?, ?, ?, ?, ?)
    `;
    await this.query(sql, [userId, activityType, ipAddress || null, userAgent || null, details ? JSON.stringify(details) : null]);
  }

  static async createNotification(userId: number, title: string, message: string, type: string = 'info', actionUrl?: string) {
    const sql = `
      INSERT INTO notifications (user_id, title, message, type, action_url)
      VALUES (?, ?, ?, ?, ?)
    `;
    await this.query(sql, [userId, title, message, type, actionUrl || null]);
  }

  static async getUserNotifications(userId: number, limit: number = 20) {
    const sql = `
      SELECT * FROM notifications 
      WHERE user_id = ? AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at DESC 
      LIMIT ?
    `;
    return await this.query(sql, [userId, limit]);
  }

  static async markNotificationAsRead(notificationId: number, userId: number) {
    const sql = `
      UPDATE notifications 
      SET is_read = TRUE, read_at = NOW() 
      WHERE id = ? AND user_id = ?
    `;
    await this.query(sql, [notificationId, userId]);
  }

  static async storeCookieConsent(
    userId: number | null, 
    ipAddress: string, 
    consentGiven: boolean, 
    consentTypes: Record<string, boolean>, 
    userAgent?: string,
    action?: string
  ) {
    const sql = `
      INSERT INTO cookie_consents (user_id, ip_address, consent_given, consent_types, action, user_agent)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      consent_given = VALUES(consent_given),
      consent_types = VALUES(consent_types),
      action = VALUES(action),
      updated_at = NOW()
    `;
    await this.query(sql, [userId, ipAddress, consentGiven, JSON.stringify(consentTypes), action || 'unknown', userAgent]);
  }

  static async getCookieConsent(userId: number | null, ipAddress: string): Promise<{
    id: number;
    user_id: number | null;
    ip_address: string;
    consent_given: boolean;
    consent_types: string;
    user_agent: string;
    created_at: string;
    updated_at: string;
  } | null> {
    const sql = `
      SELECT * FROM cookie_consents 
      WHERE (user_id = ? OR ip_address = ?) 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    return await this.queryOne(sql, [userId, ipAddress]) as {
      id: number;
      user_id: number | null;
      ip_address: string;
      consent_given: boolean;
      consent_types: string;
      user_agent: string;
      created_at: string;
      updated_at: string;
    } | null;
  }

  static async storeSecureSession(userId: number, sessionData: {
    sessionToken: string;
    ipAddress: string;
    userAgent: string;
    expiresAt: Date;
  }): Promise<void> {
    const sql = `
      INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, expires_at)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      session_token = VALUES(session_token),
      expires_at = VALUES(expires_at),
      last_activity = NOW()
    `;
    await this.query(sql, [
      userId,
      sessionData.sessionToken,
      sessionData.ipAddress,
      sessionData.userAgent,
      sessionData.expiresAt
    ]);
  }

  static async getActiveSession(sessionToken: string): Promise<{
    id: number;
    user_id: number;
    session_token: string;
    ip_address: string;
    user_agent: string;
    expires_at: string;
    created_at: string;
    last_activity: string;
    is_active: boolean;
    username: string;
    email: string;
    is_verified: boolean;
  } | null> {
    const sql = `
      SELECT s.*, u.username, u.email, u.is_verified
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.session_token = ? 
      AND s.expires_at > NOW() 
      AND s.is_active = TRUE
    `;
    return await this.queryOne(sql, [sessionToken]) as {
      id: number;
      user_id: number;
      session_token: string;
      ip_address: string;
      user_agent: string;
      expires_at: string;
      created_at: string;
      last_activity: string;
      is_active: boolean;
      username: string;
      email: string;
      is_verified: boolean;
    } | null;
  }

  static async invalidateAllUserSessions(userId: number): Promise<void> {
    const sql = 'UPDATE user_sessions SET is_active = FALSE WHERE user_id = ?';
    await this.query(sql, [userId]);
  }

  // Cleanup functions
  static async cleanupExpiredSessions() {
    const sql = 'DELETE FROM user_sessions WHERE expires_at < NOW()';
    const result = await this.query(sql) as { affectedRows: number };
    console.log(`🧹 Cleaned up ${result.affectedRows} expired sessions`);
  }

  static async cleanupExpiredVerificationCodes() {
    const sql = 'DELETE FROM verification_codes WHERE expires_at < NOW() OR is_used = TRUE';
    const result = await this.query(sql) as { affectedRows: number };
    console.log(`🧹 Cleaned up ${result.affectedRows} expired verification codes`);
  }

  // Health check
  static async healthCheck(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

export default Database;
