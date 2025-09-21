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
  is_ai_generated: number;
}

interface RatingRow extends RowDataPacket {
  id: number;
  rating: number;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const auth = SecurityService.authenticateUser(request);
    if (!auth.isAuthenticated || !auth.username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { problemId, rating } = body;

    // Validate input
    if (!problemId || typeof problemId !== 'number') {
      return NextResponse.json({ error: 'Invalid problem ID' }, { status: 400 });
    }

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 10) {
      return NextResponse.json({ error: 'Invalid rating. Must be between 1 and 10.' }, { status: 400 });
    }

    // Get user ID
    let userId: number | null = null;
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
      return NextResponse.json({ error: 'Database error: user lookup failed' }, { status: 500 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if problem exists
    let problem: ProblemRow | null = null;
    try {
      const problemRows = await Database.query(
        'SELECT id, user_id, is_public, is_ai_generated FROM code_problems WHERE id = ?',
        [problemId]
      ) as ProblemRow[];

      if (problemRows.length === 0) {
        return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
      }

      problem = problemRows[0];
    } catch (error) {
      console.error('Error fetching problem:', error);
      return NextResponse.json({ error: 'Database error: problem lookup failed' }, { status: 500 });
    }

    // Check if user has access to rate (can't rate own problems)
    if (problem.user_id === userId) {
      return NextResponse.json({ error: 'Cannot rate your own problem' }, { status: 403 });
    }

    // For AI-generated problems, allow rating even if not public
    // For user-generated problems, they must be public to be rated
    if (!problem.is_ai_generated && problem.is_public !== 1) {
      return NextResponse.json({ error: 'Can only rate public problems' }, { status: 403 });
    }

    // Check if user has already rated this problem
    let existingRating: RatingRow | null = null;
    try {
      const existingRatingRows = await Database.query(
        'SELECT id, rating FROM problem_ratings WHERE problem_id = ? AND user_id = ?',
        [problemId, userId]
      ) as RatingRow[];

      if (existingRatingRows.length > 0) {
        existingRating = existingRatingRows[0];
      }
    } catch (error) {
      console.error('Error checking existing rating:', error);
      return NextResponse.json({ error: 'Database error: rating lookup failed' }, { status: 500 });
    }

    try {
      if (existingRating) {
        // Update existing rating
        const oldRating = existingRating.rating;
        
        await Database.query(
          'UPDATE problem_ratings SET rating = ?, updated_at = NOW() WHERE problem_id = ? AND user_id = ?',
          [rating, problemId, userId]
        );

        // Update problem rating statistics
        await Database.query(
          `UPDATE code_problems 
           SET total_rating_points = total_rating_points - ? + ?,
               updated_at = NOW()
           WHERE id = ?`,
          [oldRating, rating, problemId]
        );

        return NextResponse.json({ 
          success: true, 
          message: 'Rating updated successfully!' 
        });
      } else {
        // Insert new rating
        await Database.query(
          'INSERT INTO problem_ratings (problem_id, user_id, rating, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
          [problemId, userId, rating]
        );

        // Update problem rating statistics
        await Database.query(
          `UPDATE code_problems 
           SET rating_count = rating_count + 1,
               total_rating_points = total_rating_points + ?,
               rating = (total_rating_points + ?) / (rating_count + 1),
               updated_at = NOW()
           WHERE id = ?`,
          [rating, rating, problemId]
        );

        return NextResponse.json({ 
          success: true, 
          message: 'Rating submitted successfully!' 
        });
      }
    } catch (error) {
      console.error('Database error during rating submission:', error);
      return NextResponse.json({ error: 'Database error: failed to save rating' }, { status: 500 });
    }

  } catch (error) {
    console.error('Submit rating error:', error);
    return NextResponse.json(
      { error: 'Failed to submit rating. Please try again.' },
      { status: 500 }
    );
  }
}