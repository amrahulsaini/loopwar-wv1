// Script to manually verify a user in the database
// Usage: node scripts/verify-user.js <username>

const mysql = require('mysql2/promise');

async function verifyUser(username) {
  try {
    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'loop_wv1',
      port: process.env.DB_PORT || 3306
    });

    console.log('Connected to database');

    // Check if user exists
    const [users] = await connection.execute(
      'SELECT id, username, email, is_verified FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      console.log(`❌ User '${username}' not found`);
      await connection.end();
      return;
    }

    const user = users[0];
    console.log('User found:', user);

    if (user.is_verified) {
      console.log(`✅ User '${username}' is already verified`);
      await connection.end();
      return;
    }

    // Verify the user
    await connection.execute(
      'UPDATE users SET is_verified = TRUE, verification_code = NULL, verification_code_expires = NULL WHERE username = ?',
      [username]
    );

    console.log(`✅ User '${username}' has been verified successfully`);

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Get username from command line arguments
const username = process.argv[2];
if (!username) {
  console.log('Usage: node scripts/verify-user.js <username>');
  process.exit(1);
}

verifyUser(username);
