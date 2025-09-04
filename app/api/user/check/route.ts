import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306'),
  charset: 'utf8mb4'
};

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Create database connection
    const connection = await mysql.createConnection(dbConfig);

    try {
      // Check if user exists in database
      const [rows] = await connection.execute(
        'SELECT username FROM users WHERE username = ? LIMIT 1',
        [username]
      );

      const userExists = Array.isArray(rows) && rows.length > 0;

      console.log('🔍 User existence check:', { username, exists: userExists });

      return NextResponse.json({ 
        exists: userExists,
        username: username 
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('❌ Error checking user existence:', error);
    
    return NextResponse.json(
      { error: 'Failed to check user existence' },
      { status: 500 }
    );
  }
}
