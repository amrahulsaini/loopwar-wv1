import { NextRequest, NextResponse } from 'next/server';
import { Database } from '../../../../../lib/database';
import { SecurityService } from '../../../../../lib/security';
import { RowDataPacket } from 'mysql2';

interface ProblemRow extends RowDataPacket {
  id: number;
  problem_name: string;
  problem_description: string;
  difficulty: string;
  sort_order: number;
  category_name: string;
  topic_name: string;
  subtopic_name: string;
}

// GET - Fetch individual problem by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const auth = SecurityService.authenticateUser(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: problemId } = await params;

    if (!problemId || isNaN(Number(problemId))) {
      return NextResponse.json(
        { success: false, message: 'Invalid problem ID' },
        { status: 400 }
      );
    }

    const query = `
      SELECT
        p.id,
        p.problem_name as title,
        p.problem_description as description,
        p.difficulty,
        p.sort_order,
        c.name as category_name,
        t.name as topic_name,
        s.name as subtopic_name
      FROM problems p
      JOIN categories c ON p.category_id = c.id
      JOIN topics t ON p.topic_id = t.id
      JOIN subtopics s ON p.subtopic_id = s.id
      WHERE p.id = ? AND p.status = 'active'
    `;

    const problems = await Database.query(query, [problemId]) as ProblemRow[];

    if (problems.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Problem not found' },
        { status: 404 }
      );
    }

    const problem = problems[0];

    // Format the response to match what the frontend expects
    const formattedProblem = {
      id: problem.id,
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty as 'Easy' | 'Medium' | 'Hard',
      solved: false, // TODO: Check user's progress
      timeSpent: null,
      lastAttempt: null
    };

    return NextResponse.json({
      success: true,
      problem: formattedProblem
    });

  } catch (error) {
    console.error('Error fetching problem:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
