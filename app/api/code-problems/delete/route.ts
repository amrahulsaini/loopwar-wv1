import { NextRequest, NextResponse } from 'next/server';
import Database from '../../../../lib/database';
import { SecurityService } from '../../../../lib/security';
import { RowDataPacket } from 'mysql2';

interface CodeProblemRow extends RowDataPacket {
  id: number;
}

// POST /api/code-problems/delete
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const auth = SecurityService.authenticateUser(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category, topic, subtopic, sortOrder } = await request.json();

    if (!category || !topic || !subtopic || typeof sortOrder !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if code problem exists
    const existingProblem = await Database.query(
      `SELECT id FROM code_problems 
       WHERE category = ? AND topic = ? AND subtopic = ? AND sort_order = ?`,
      [category, topic, subtopic, sortOrder]
    ) as CodeProblemRow[];

    if (!existingProblem || existingProblem.length === 0) {
      return NextResponse.json(
        { error: 'Code problem not found' },
        { status: 404 }
      );
    }

    const problemId = existingProblem[0].id;

    // Delete related submissions first (foreign key constraint)
    await Database.query(
      'DELETE FROM code_submissions WHERE problem_id = ?',
      [problemId]
    );

    // Delete user progress records
    await Database.query(
      'DELETE FROM user_code_progress WHERE problem_id = ?', 
      [problemId]
    );

    // Delete the code problem
    await Database.query(
      'DELETE FROM code_problems WHERE id = ?',
      [problemId]
    );

    console.log('Deleted code problem:', { problemId, category, topic, subtopic, sortOrder });

    return NextResponse.json({ 
      success: true,
      message: 'Code problem deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting code problem:', error);
    
    return NextResponse.json(
      { error: 'Failed to delete code problem' },
      { status: 500 }
    );
  }
}