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
    const userId = searchParams.get('user_id');
    const problemId = searchParams.get('problem_id');

    if (!userId || !problemId) {
      return NextResponse.json(
        { error: 'Missing required parameters: user_id and problem_id' },
        { status: 400 }
      );
    }

    // Get database connection
    const connection = await mysql.createConnection(dbConfig);

    try {
      // Find existing session for this problem
      const [sessionRows] = await connection.execute(
        'SELECT id FROM ai_chat_sessions WHERE user_id = ? AND problem_id = ? ORDER BY last_message_at DESC LIMIT 1',
        [userId, problemId]
      );

      if ((sessionRows as mysql.RowDataPacket[]).length > 0) {
        const session = (sessionRows as mysql.RowDataPacket[])[0];
        return NextResponse.json({
          session_id: session.id,
          found: true
        });
      } else {
        return NextResponse.json({
          session_id: null,
          found: false
        });
      }

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('AI Chat Session API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
