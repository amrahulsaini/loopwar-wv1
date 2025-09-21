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

    const { problemId, code, language } = await request.json();

    if (!problemId || !code || !language) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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
          console.log('Found user ID:', userId, 'for username:', auth.username);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if problem exists and user has access
    const problemRows = await Database.query(
      'SELECT id, user_id, is_public FROM code_problems WHERE id = ?',
      [problemId]
    ) as ProblemRow[];

    if (problemRows.length === 0) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    const problem = problemRows[0];

    // Check if user owns the problem or if it's public
    if (problem.user_id !== userId && problem.is_public !== 1) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update submission count and mark as submitted
    await Database.query(
      `UPDATE code_problems 
       SET is_submitted = 1, 
           submission_count = submission_count + 1,
           updated_at = NOW()
       WHERE id = ?`,
      [problemId]
    );

    // Try to insert or update submission record - if table doesn't exist, skip this
    try {
      await Database.query(
        `INSERT INTO code_submissions (problem_id, user_id, code, language, submitted_at)
         VALUES (?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE 
         code = VALUES(code),
         language = VALUES(language),
         submitted_at = VALUES(submitted_at)`,
        [problemId, userId, code, language]
      );
    } catch (submissionError) {
      console.log('Code submissions table may not exist, skipping submission record');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Code submitted successfully!' 
    });

  } catch (error) {
    console.error('Submit code error:', error);
    return NextResponse.json(
      { error: 'Failed to submit code' },
      { status: 500 }
    );
  }
}