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

interface RatingRow extends RowDataPacket {
  id: number;
  rating: number;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const auth = SecurityService.authenticateUser(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { problemId, rating } = await request.json();

    if (!problemId || !rating || rating < 1 || rating > 10) {
      return NextResponse.json({ error: 'Invalid rating. Must be between 1 and 10.' }, { status: 400 });
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

    // Check if problem exists
    const problemRows = await Database.query(
      'SELECT id, user_id, is_public FROM code_problems WHERE id = ?',
      [problemId]
    ) as ProblemRow[];

    if (problemRows.length === 0) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    const problem = problemRows[0];

    // Check if user has access to rate (can't rate own problems, or problem must be public)
    if (problem.user_id === userId) {
      return NextResponse.json({ error: 'Cannot rate your own problem' }, { status: 403 });
    }

    if (problem.is_public !== 1) {
      return NextResponse.json({ error: 'Can only rate public problems' }, { status: 403 });
    }

    // Check if user has already rated this problem
    const existingRatingRows = await Database.query(
      'SELECT id, rating FROM problem_ratings WHERE problem_id = ? AND user_id = ?',
      [problemId, userId]
    ) as RatingRow[];

    if (existingRatingRows.length > 0) {
      // Update existing rating
      const oldRating = existingRatingRows[0].rating;
      
      await Database.query(
        'UPDATE problem_ratings SET rating = ?, rated_at = NOW() WHERE problem_id = ? AND user_id = ?',
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
        'INSERT INTO problem_ratings (problem_id, user_id, rating, rated_at) VALUES (?, ?, ?, NOW())',
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
    console.error('Submit rating error:', error);
    return NextResponse.json(
      { error: 'Failed to submit rating' },
      { status: 500 }
    );
  }
}