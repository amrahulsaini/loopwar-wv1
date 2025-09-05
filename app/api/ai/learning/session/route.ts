import { NextRequest, NextResponse } from 'next/server';
import Database from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { problemId, sessionToken, title, userId = null } = await request.json();

    if (!problemId || !sessionToken || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create learning session
    const result = await Database.query(
      'INSERT INTO learning_sessions (user_id, problem_id, session_token, title, status) VALUES (?, ?, ?, ?, ?)',
      [userId, problemId, sessionToken, title, 'active']
    ) as any;

    // Create initial analytics record
    await Database.query(
      'INSERT INTO learning_analytics (user_id, session_id, problem_id) VALUES (?, ?, ?)',
      [userId, result.insertId, problemId]
    );

    return NextResponse.json({
      success: true,
      sessionId: result.insertId,
      sessionToken
    });

  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create learning session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionToken = searchParams.get('sessionToken');
    const userId = searchParams.get('userId');

    if (!sessionToken && !userId) {
      return NextResponse.json({ error: 'Session token or user ID required' }, { status: 400 });
    }

    let sessions;
    if (sessionToken) {
      // Get specific session
      sessions = await Database.query(
        `SELECT ls.*, p.problem_name, p.problem_description, p.difficulty,
                c.name as category_name, t.name as topic_name, st.name as subtopic_name
         FROM learning_sessions ls
         JOIN problems p ON ls.problem_id = p.id
         JOIN categories c ON p.category_id = c.id
         JOIN topics t ON p.topic_id = t.id
         JOIN subtopics st ON p.subtopic_id = st.id
         WHERE ls.session_token = ?`,
        [sessionToken]
      );
    } else {
      // Get user sessions
      sessions = await Database.query(
        `SELECT ls.*, p.problem_name, p.problem_description, p.difficulty,
                c.name as category_name, t.name as topic_name, st.name as subtopic_name
         FROM learning_sessions ls
         JOIN problems p ON ls.problem_id = p.id
         JOIN categories c ON p.category_id = c.id
         JOIN topics t ON p.topic_id = t.id
         JOIN subtopics st ON p.subtopic_id = st.id
         WHERE ls.user_id = ?
         ORDER BY ls.last_activity DESC`,
        [userId]
      );
    }

    return NextResponse.json({
      success: true,
      sessions
    });

  } catch (error) {
    console.error('Session fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch learning sessions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
