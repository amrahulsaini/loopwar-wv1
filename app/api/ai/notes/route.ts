import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, session_id, note_title, note_content, note_type, problem_id } = body;

    if (!user_id || !note_title || !note_content) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, note_title, note_content' },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    try {
      const [result] = await connection.execute(
        'INSERT INTO ai_generated_notes (user_id, session_id, problem_id, note_title, note_content, note_type, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [user_id, session_id || null, problem_id || null, note_title, note_content, note_type || 'concept_explanation']
      );

      return NextResponse.json({
        success: true,
        note_id: (result as mysql.ResultSetHeader).insertId,
        message: 'Note created successfully'
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Create Note API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  const sessionId = searchParams.get('session_id');

  if (!userId) {
    return NextResponse.json(
      { error: 'Missing user_id parameter' },
      { status: 400 }
    );
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    try {
      let query = 'SELECT * FROM ai_generated_notes WHERE user_id = ?';
      const params: (string | number)[] = [userId];

      if (sessionId) {
        query += ' AND session_id = ?';
        params.push(sessionId);
      }

      query += ' ORDER BY updated_at DESC';

      const [notes] = await connection.execute(query, params);

      return NextResponse.json({ notes });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Get Notes API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
