import { NextRequest, NextResponse } from 'next/server';
import Database from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Get session by token
    const sessions = await Database.query(
      'SELECT id FROM learning_sessions WHERE session_token = ?',
      [sessionId]
    ) as any[];

    if (sessions.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const sessionDbId = sessions[0].id;

    // Get notes for the session
    const notes = await Database.query(
      'SELECT * FROM ai_generated_notes WHERE session_id = ? ORDER BY order_index, created_at',
      [sessionDbId]
    );

    return NextResponse.json({
      success: true,
      notes
    });

  } catch (error) {
    console.error('Notes fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch notes',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, notes } = await request.json();

    if (!sessionId || !Array.isArray(notes)) {
      return NextResponse.json({ error: 'Session ID and notes array required' }, { status: 400 });
    }

    // Get session by token
    const sessions = await Database.query(
      'SELECT id FROM learning_sessions WHERE session_token = ?',
      [sessionId]
    ) as any[];

    if (sessions.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const sessionDbId = sessions[0].id;

    // Save notes (simple implementation - you can enhance this)
    for (const note of notes) {
      await Database.query(
        'INSERT INTO ai_generated_notes (session_id, note_type, title, content, order_index) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE content = VALUES(content), updated_at = NOW()',
        [sessionDbId, note.type, note.title, note.content, note.id]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notes saved successfully'
    });

  } catch (error) {
    console.error('Notes save error:', error);
    return NextResponse.json({ 
      error: 'Failed to save notes',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
