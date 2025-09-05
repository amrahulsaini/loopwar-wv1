import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// GET - Fetch user's notes for a specific problem/session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const problemId = searchParams.get('problem_id');
    const sessionId = searchParams.get('session_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    try {
      // First try to get from learning_notes table
      let query = `
        SELECT id, title, content, note_type, is_auto_generated, created_at, updated_at
        FROM learning_notes 
        WHERE user_id = ?
      `;
      const params = [userId];

      if (problemId) {
        query += ` AND problem_id = ?`;
        params.push(problemId);
      }

      if (sessionId) {
        query += ` AND session_id = ?`;
        params.push(sessionId);
      }

      query += ` ORDER BY created_at ASC`;

      const [notes] = await connection.execute(query, params);

      return NextResponse.json({
        notes: notes,
        count: (notes as mysql.RowDataPacket[]).length
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Notes GET API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new note (enhanced for learning workspace)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      user_id, 
      session_id, 
      note_title, 
      note_content, 
      note_type = 'personal', 
      problem_id, 
      is_auto_generated = false,
      // Legacy support
      title,
      content
    } = body;

    // Support both old and new field names
    const finalTitle = title || note_title;
    const finalContent = content || note_content;

    if (!user_id || !finalTitle || !finalContent) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, title/note_title, content/note_content' },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    try {
      // Try to insert into learning_notes table first
      try {
        const [result] = await connection.execute(`
          INSERT INTO learning_notes (user_id, problem_id, session_id, title, content, note_type, is_auto_generated)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [user_id, problem_id || null, session_id || null, finalTitle, finalContent, note_type, is_auto_generated]);

        const noteId = (result as mysql.ResultSetHeader).insertId;

        return NextResponse.json({
          success: true,
          note_id: noteId,
          message: 'Note created successfully'
        }, { status: 201 });

      } catch (dbError) {
        // If learning_notes table doesn't exist, fall back to old table
        console.log('Falling back to ai_generated_notes table');
        
        const [result] = await connection.execute(
          'INSERT INTO ai_generated_notes (user_id, session_id, problem_id, note_title, note_content, note_type, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
          [user_id, session_id || null, problem_id || null, finalTitle, finalContent, note_type]
        );

        return NextResponse.json({
          success: true,
          note_id: (result as mysql.ResultSetHeader).insertId,
          message: 'Note created successfully (legacy)'
        });
      }

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

// PUT - Update an existing note
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { note_id, user_id, title, content, note_title, note_content } = body;

    // Support both old and new field names
    const finalTitle = title || note_title;
    const finalContent = content || note_content;

    if (!note_id || !user_id || !finalTitle || !finalContent) {
      return NextResponse.json(
        { error: 'Note ID, User ID, title, and content are required' },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    try {
      // Try to update in learning_notes table first
      const [result] = await connection.execute(`
        UPDATE learning_notes 
        SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `, [finalTitle, finalContent, note_id, user_id]);

      if ((result as mysql.ResultSetHeader).affectedRows === 0) {
        return NextResponse.json(
          { error: 'Note not found or unauthorized' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Note updated successfully'
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Notes PUT API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
