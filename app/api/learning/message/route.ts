import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, message } = body;

    if (!sessionId || !message) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const db = await connection;

    // Save message to database
    await db.execute(`
      INSERT INTO conversation_messages 
      (session_id, message_type, content, prompt_type, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [
      sessionId,
      message.type,
      message.content,
      message.promptType || null
    ]);

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error('Message save error:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}
