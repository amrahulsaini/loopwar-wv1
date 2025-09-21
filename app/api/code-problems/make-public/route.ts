import { NextRequest, NextResponse } from 'next/server';
import Database from '../../../../lib/database';
import { SecurityService } from '../../../../lib/security';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  email: string;
}

interface ProblemRow extends RowDataPacket {
  id: number;
  user_id: number;
  is_public: number;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const auth = SecurityService.authenticateUser(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { problemId, isPublic } = await request.json();

    if (!problemId || typeof isPublic !== 'boolean') {
      return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 });
    }

    // Get user ID
    let userId: number | null = null;
    if (auth.username) {
      try {
        const userRows = await Database.query(
          'SELECT id FROM users WHERE username = ?',
          [auth.username]
        ) as UserRow[];
        
        if (userRows.length > 0) {
          userId = userRows[0].id;
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if problem exists and user owns it
    const problemRows = await Database.query(
      'SELECT id, user_id, is_public FROM code_problems WHERE id = ?',
      [problemId]
    ) as ProblemRow[];

    if (problemRows.length === 0) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    const problem = problemRows[0];

    // Check if user owns the problem
    if (problem.user_id !== userId) {
      return NextResponse.json({ error: 'You can only modify your own problems' }, { status: 403 });
    }

    // Update the public status
    await Database.query(
      `UPDATE code_problems 
       SET is_public = ?,
           updated_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [isPublic ? 1 : 0, problemId, userId]
    );

    return NextResponse.json({ 
      success: true, 
      message: isPublic 
        ? 'Problem is now publicly available!' 
        : 'Problem is now private.',
      isPublic: isPublic
    });

  } catch (error) {
    console.error('Make public error:', error);
    return NextResponse.json(
      { error: 'Failed to update problem visibility' },
      { status: 500 }
    );
  }
}