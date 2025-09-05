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
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing required parameter: session_id' },
        { status: 400 }
      );
    }

    // Get database connection
    const connection = await mysql.createConnection(dbConfig);

    try {
      // Get all messages for this session
      const [messageRows] = await connection.execute(
        'SELECT id, message_type, content, created_at FROM ai_chat_messages WHERE session_id = ? ORDER BY created_at ASC',
        [sessionId]
      );

      return NextResponse.json({
        messages: messageRows as mysql.RowDataPacket[],
        count: (messageRows as mysql.RowDataPacket[]).length
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('AI Chat Messages API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
