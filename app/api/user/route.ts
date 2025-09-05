import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export async function GET(request: NextRequest) {
  try {
    // Get user info from cookies (no database call needed for basic info)
    const cookies = request.headers.get('cookie') || '';
    const sessionToken = cookies.split(';')
      .find(c => c.trim().startsWith('sessionToken='))
      ?.split('=')[1];
    
    const username = cookies.split(';')
      .find(c => c.trim().startsWith('username='))
      ?.split('=')[1];
    
    if (!sessionToken || !username) {
      return NextResponse.json(
        { error: 'No active session' }, 
        { status: 401 }
      );
    }

    // Get user ID from database
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [rows] = await connection.execute(
        'SELECT id FROM users WHERE username = ?',
        [decodeURIComponent(username)]
      );

      const userRows = rows as mysql.RowDataPacket[];
      if (userRows.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const userId = userRows[0].id;

      // Return user info with ID
      return NextResponse.json({ 
        id: userId,
        username: decodeURIComponent(username),
        authenticated: true 
      });
    } finally {
      await connection.end();
    }
    
  } catch (error) {
    console.error('User API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user information' }, 
      { status: 500 }
    );
  }
}
