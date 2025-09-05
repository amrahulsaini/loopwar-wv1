import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { problemId } = body;

    if (!problemId) {
      return NextResponse.json(
        { error: 'Problem ID is required' },
        { status: 400 }
      );
    }

    const db = await connection;

    // Check if user is authenticated
    let userId = null;
    try {
      const userResponse = await fetch(new URL('/api/user', request.url), {
        headers: request.headers,
      });
      if (userResponse.ok) {
        const userData = await userResponse.json();
        userId = userData.id;
      }
    } catch {
      // Continue as anonymous user
    }

    // Generate session token
    const sessionToken = uuidv4();

    // Get problem title
    const [problemRows] = await db.execute(
      'SELECT title FROM problems WHERE id = ?',
      [problemId]
    );
    const problems = problemRows as Array<{ title: string; [key: string]: unknown }>;
    const problemTitle = problems[0]?.title || 'Unknown Problem';

    // Check for existing active session
    let sessionId;
    if (userId) {
      const [existingSessions] = await db.execute(`
        SELECT id FROM learning_sessions 
        WHERE user_id = ? AND problem_id = ? AND status = 'active'
        ORDER BY last_activity DESC LIMIT 1
      `, [userId, problemId]);

      const existing = existingSessions as Array<{ id: number; [key: string]: unknown }>;
      if (existing.length > 0) {
        sessionId = existing[0].id;
      }
    }

    // Create new session if none exists
    if (!sessionId) {
      const [result] = await db.execute(`
        INSERT INTO learning_sessions (user_id, problem_id, session_token, title, status)
        VALUES (?, ?, ?, ?, 'active')
      `, [userId, problemId, sessionToken, problemTitle]);

      sessionId = (result as { insertId: number }).insertId;
    }

    // Fetch existing messages and notes
    const [messageRows] = await db.execute(`
      SELECT message_type as type, content, created_at as timestamp, prompt_type
      FROM conversation_messages 
      WHERE session_id = ? 
      ORDER BY created_at ASC
    `, [sessionId]);

    const [noteRows] = await db.execute(`
      SELECT type, title, content, is_important as isImportant
      FROM ai_generated_notes 
      WHERE session_id = ? 
      ORDER BY order_index ASC
    `, [sessionId]);

    const messages = (messageRows as Array<{
      type: string;
      content: string;
      timestamp: string;
      prompt_type?: string;
    }>).map(msg => ({
      id: Date.now() + Math.random(),
      type: msg.type,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      promptType: msg.prompt_type
    }));

    const notes = (noteRows as Array<{
      type: string;
      title: string;
      content: string;
      isImportant: boolean;
    }>).map(note => ({
      id: Date.now() + Math.random(),
      type: note.type,
      title: note.title,
      content: note.content,
      isImportant: note.isImportant
    }));

    return NextResponse.json({
      success: true,
      sessionId: sessionId.toString(),
      sessionToken,
      messages,
      notes
    });

  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
