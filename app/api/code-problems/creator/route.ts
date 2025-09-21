import { NextRequest, NextResponse } from 'next/server';
import Database from '../../../../lib/database';
import { RowDataPacket } from 'mysql2';

interface CreatorRow extends RowDataPacket {
  username: string;
  profile_picture: string | null;
  created_at: string;
}

interface ProblemRow extends RowDataPacket {
  id: number;
  user_id: number;
  title: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const problemId = searchParams.get('problemId');

    if (!problemId) {
      return NextResponse.json({ error: 'Problem ID is required' }, { status: 400 });
    }

    // Get problem details with creator info
    const problemRows = await Database.query(
      `SELECT p.id, p.user_id, p.title, u.username, u.profile_picture, u.created_at
       FROM code_problems p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [problemId]
    ) as (ProblemRow & CreatorRow)[];

    if (problemRows.length === 0) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    const problem = problemRows[0];

    if (!problem.username) {
      return NextResponse.json({ error: 'Creator information not available' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      creator: {
        username: problem.username,
        profilePicture: problem.profile_picture,
        memberSince: problem.created_at
      },
      problem: {
        id: problem.id,
        title: problem.title
      }
    });

  } catch (error) {
    console.error('Get creator info error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch creator information' },
      { status: 500 }
    );
  }
}