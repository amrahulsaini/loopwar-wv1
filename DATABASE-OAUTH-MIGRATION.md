# OAuth Database Migration Guide

## 🚨 URGENT: Add Missing OAuth Columns to Database

The error shows that your production database is missing the OAuth columns. You need to run this migration on your server.

## Method 1: Direct MySQL Command (Recommended)

SSH into your server and run these commands:

```bash
# Connect to MySQL
mysql -u loop_wv1 -p loop_wv1

# Run these SQL commands one by one:
ALTER TABLE users ADD COLUMN oauth_provider VARCHAR(50) NULL AFTER profile_picture;
ALTER TABLE users ADD COLUMN oauth_id VARCHAR(255) NULL AFTER oauth_provider;
ALTER TABLE users ADD INDEX idx_oauth_provider (oauth_provider);
ALTER TABLE users ADD INDEX idx_oauth_id (oauth_id);

# Verify the changes
DESCRIBE users;

# Exit MySQL
EXIT;
```

## Method 2: Using Migration File

```bash
# SSH to your server
ssh root@rajpanel

# Navigate to project directory
cd /home/loopwar.dev/public_html/loopwar-wv1

# Run the migration
mysql -u loop_wv1 -p loop_wv1 < database/oauth-migration.sql
```

## Method 3: Copy-Paste Commands

If you prefer, copy and paste these SQL commands directly in your MySQL client:

```sql
USE loop_wv1;

ALTER TABLE users 
ADD COLUMN oauth_provider VARCHAR(50) NULL AFTER profile_picture,
ADD COLUMN oauth_id VARCHAR(255) NULL AFTER oauth_provider;

ALTER TABLE users 
ADD INDEX idx_oauth_provider (oauth_provider),
ADD INDEX idx_oauth_id (oauth_id);

DESCRIBE users;
```

## Expected Result

After running the migration, you should see these columns in your users table:

```
| Field                     | Type             | Null | Key | Default | Extra          |
|---------------------------|------------------|------|-----|---------|----------------|
| id                        | int(11)          | NO   | PRI | NULL    | auto_increment |
| username                  | varchar(50)      | NO   | UNI | NULL    |                |
| email                     | varchar(255)     | NO   | UNI | NULL    |                |
| password_hash             | varchar(255)     | NO   |     | NULL    |                |
| is_verified               | tinyint(1)       | YES  |     | 0       |                |
| verification_code         | varchar(6)       | YES  | MUL | NULL    |                |
| verification_code_expires | datetime         | YES  |     | NULL    |                |
| session_token             | varchar(255)     | YES  | MUL | NULL    |                |
| session_expires           | datetime         | YES  |     | NULL    |                |
| created_at                | timestamp        | NO   |     | CURRENT_TIMESTAMP |     |
| updated_at                | timestamp        | NO   |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |
| last_login                | timestamp        | YES  |     | NULL    |                |
| profile_picture           | varchar(255)     | YES  |     | NULL    |                |
| oauth_provider            | varchar(50)      | YES  | MUL | NULL    |                |  ← NEW
| oauth_id                  | varchar(255)     | YES  | MUL | NULL    |                |  ← NEW
```

## After Migration

1. **Restart your application**:
   ```bash
   pm2 restart loopwar
   ```

2. **Test OAuth**:
   - Visit https://loopwar.dev/join
   - Try "Join with Google" or "Join with GitHub"
   - Should work without errors!

## If You Need Help

If you're not comfortable with SQL, here's the safest approach:

1. **Backup your database first**:
   ```bash
   mysqldump -u loop_wv1 -p loop_wv1 > backup_before_oauth.sql
   ```

2. **Run the migration**:
   ```bash
   mysql -u loop_wv1 -p loop_wv1 < database/oauth-migration.sql
   ```

3. **Restart the app**:
   ```bash
   pm2 restart loopwar
   ```

The OAuth authentication will work perfectly after this migration! 🚀
