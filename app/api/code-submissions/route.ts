import { NextRequest, NextResponse } from 'next/server';
import Database from '../../../lib/database';
import { SecurityService } from '../../../lib/security';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface SubmissionData {
  problemId: number;
  code: string;
  language: string;
  result: {
    success: boolean;
    isCorrect?: boolean;
    score?: number;
    feedback?: string;
    detailedAnalysis?: {
      syntax?: {
        isValid: boolean;
        issues: string[];
      };
      logic?: {
        isCorrect: boolean;
        issues: string[];
        suggestions: string[];
      };
      efficiency?: {
        timeComplexity: string;
        spaceComplexity: string;
        rating: number;
        improvements: string[];
      };
      testCases?: {
        passed: number;
        total: number;
        results: Array<{
          input: string;
          expectedOutput: string;
          actualOutput: string;
          passed: boolean;
          explanation: string;
        }>;
      };
    };
    hints?: string[];
    learningPoints?: string[];
    // Legacy format for backward compatibility
    results?: Array<{
      testCase: number;
      passed: boolean;
      input: string;
      expected: string;
      actual: string;
      error?: string;
      executionTime?: string;
      memory?: number;
    }>;
    overallStatus?: string;
    error?: string;
  };
  category: string;
  topic: string;
  subtopic: string;
  sortOrder: number;
}

interface UserRow extends RowDataPacket {
  id: number;
}

interface ProgressRow extends RowDataPacket {
  id: number;
  attempts_count: number;
  is_solved: boolean;
  best_submission_id?: number;
}

interface SubmissionRow extends RowDataPacket {
  id: number;
  problem_id: number;
  language: string;
  status: string;
  total_test_cases: number;
  passed_test_cases: number;
  execution_time: number | null;
  memory_used: number | null;
  submitted_at: string;
}

// POST /api/code-submissions
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const auth = SecurityService.authenticateUser(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const submissionData: SubmissionData = await request.json();

    if (!submissionData.problemId || !submissionData.code || !submissionData.language || !submissionData.result) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user ID
    const userResult = await Database.query(
      'SELECT id FROM users WHERE username = ?',
      [auth.username]
    ) as UserRow[];

    if (!userResult || userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userResult[0].id;

    // Determine submission status based on results
    let status = 'Wrong Answer';
    
    // Handle AI format
    if (submissionData.result.isCorrect !== undefined) {
      if (submissionData.result.isCorrect) {
        status = 'Accepted';
      } else if (submissionData.result.detailedAnalysis?.syntax && !submissionData.result.detailedAnalysis.syntax.isValid) {
        status = 'Compilation Error';
      } else {
        status = 'Wrong Answer';
      }
    } 
    // Handle legacy format
    else if (submissionData.result.error) {
      if (submissionData.result.error.includes('compilation') || submissionData.result.error.includes('compile')) {
        status = 'Compilation Error';
      } else if (submissionData.result.error.includes('timeout') || submissionData.result.error.includes('time')) {
        status = 'Time Limit Exceeded';
      } else if (submissionData.result.error.includes('memory')) {
        status = 'Memory Limit Exceeded';
      } else {
        status = 'Runtime Error';
      }
    } else if (submissionData.result.success) {
      status = 'Accepted';
    }

    // Calculate execution statistics - handle both AI and legacy formats
    let totalTestCases = 0;
    let passedTestCases = 0;
    let avgExecutionTime = null;
    let maxMemoryUsed = null;

    if (submissionData.result.detailedAnalysis?.testCases) {
      // New AI format
      totalTestCases = submissionData.result.detailedAnalysis.testCases.total;
      passedTestCases = submissionData.result.detailedAnalysis.testCases.passed;
    } else if (submissionData.result.results) {
      // Legacy format
      totalTestCases = submissionData.result.results.length;
      passedTestCases = submissionData.result.results.filter(r => r.passed).length;
      
      // Get average execution time
      const executionTimes = submissionData.result.results
        .filter(r => r.executionTime)
        .map(r => parseFloat(r.executionTime || '0'));
      avgExecutionTime = executionTimes.length > 0 
        ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length 
        : null;

      // Get max memory usage
      const memoryUsages = submissionData.result.results
        .filter(r => r.memory)
        .map(r => r.memory || 0);
      maxMemoryUsed = memoryUsages.length > 0 ? Math.max(...memoryUsages) : null;
    }

    // Insert submission record
    const submissionResult = await Database.query(
      `INSERT INTO code_submissions (
        user_id, problem_id, code, language, status, test_results,
        execution_time, memory_used, total_test_cases, passed_test_cases,
        category, topic, subtopic, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        submissionData.problemId,
        submissionData.code,
        submissionData.language,
        status,
        JSON.stringify(submissionData.result),
        avgExecutionTime,
        maxMemoryUsed,
        totalTestCases,
        passedTestCases,
        submissionData.category,
        submissionData.topic,
        submissionData.subtopic,
        submissionData.sortOrder
      ]
    ) as ResultSetHeader;

    const submissionId = submissionResult.insertId;

    // Update user progress
    const isSolved = status === 'Accepted';
    
    // Check if user progress record exists
    const progressResult = await Database.query(
      `SELECT id, attempts_count, is_solved, best_submission_id FROM user_code_progress 
       WHERE user_id = ? AND problem_id = ?`,
      [userId, submissionData.problemId]
    ) as ProgressRow[];

    if (progressResult && progressResult.length > 0) {
      // Update existing progress
      const progress = progressResult[0];
      const newAttempts = progress.attempts_count + 1;
      const shouldUpdateBest = isSolved && (!progress.is_solved || !progress.best_submission_id);
      const firstSolvedAt = isSolved && !progress.is_solved ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null;

      await Database.query(
        `UPDATE user_code_progress SET 
         attempts_count = ?, 
         is_solved = ?, 
         best_submission_id = ?,
         first_solved_at = COALESCE(first_solved_at, ?),
         last_attempt_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          newAttempts,
          isSolved || progress.is_solved,
          shouldUpdateBest ? submissionId : progress.best_submission_id,
          firstSolvedAt,
          progress.id
        ]
      );
    } else {
      // Create new progress record
      await Database.query(
        `INSERT INTO user_code_progress (
          user_id, problem_id, category, topic, subtopic, sort_order,
          is_solved, best_submission_id, attempts_count, first_solved_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          submissionData.problemId,
          submissionData.category,
          submissionData.topic,
          submissionData.subtopic,
          submissionData.sortOrder,
          isSolved,
          isSolved ? submissionId : null,
          1,
          isSolved ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null
        ]
      );
    }

    return NextResponse.json({
      submissionId,
      status,
      passedTestCases,
      totalTestCases,
      executionTime: avgExecutionTime,
      memoryUsed: maxMemoryUsed,
      success: isSolved
    });

  } catch (error) {
    console.error('Error saving code submission:', error);
    return NextResponse.json(
      { error: 'Failed to save submission' },
      { status: 500 }
    );
  }
}

// GET /api/code-submissions - Get user's submissions
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const auth = SecurityService.authenticateUser(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const problemId = searchParams.get('problemId');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get user ID
    const userResult = await Database.query(
      'SELECT id FROM users WHERE username = ?',
      [auth.username]
    ) as UserRow[];

    if (!userResult || userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userResult[0].id;

    let query = `
      SELECT id, problem_id, language, status, total_test_cases, passed_test_cases,
             execution_time, memory_used, submitted_at
      FROM code_submissions 
      WHERE user_id = ?
    `;
    const queryParams: (number | string)[] = [userId];

    if (problemId) {
      query += ' AND problem_id = ?';
      queryParams.push(parseInt(problemId));
    }

    query += ' ORDER BY submitted_at DESC LIMIT ?';
    queryParams.push(limit);

    const submissions = await Database.query(query, queryParams) as SubmissionRow[];

    return NextResponse.json({ submissions });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}