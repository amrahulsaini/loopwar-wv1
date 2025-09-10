import { NextRequest, NextResponse } from 'next/server';
import Database from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quizId, userAnswers, score, totalQuestions, correctAnswers, timeSpent } = body;

    if (!quizId || !userAnswers || score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user ID (you might need to implement authentication first)
    // For now, we'll use a placeholder or guest user
    const userId = 'guest'; // Replace with actual user authentication

    // Insert quiz result
    const resultId = await Database.query(
      `INSERT INTO quiz_results 
       (quiz_id, user_id, score, total_questions, correct_answers, time_spent, completed_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [quizId, userId, score, totalQuestions, correctAnswers, timeSpent]
    ) as any;

    // Insert individual answer records
    for (const answer of userAnswers) {
      await Database.query(
        `INSERT INTO quiz_user_answers 
         (result_id, question_id, user_answer, is_correct, time_taken) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          resultId.insertId,
          answer.questionId,
          typeof answer.answer === 'object' ? JSON.stringify(answer.answer) : String(answer.answer),
          answer.isCorrect ? 1 : 0,
          answer.timeTaken || 0
        ]
      );
    }

    // Update quiz statistics
    await Database.query(
      `UPDATE quizzes 
       SET attempts = attempts + 1, 
           average_score = (
             SELECT AVG(score) 
             FROM quiz_results 
             WHERE quiz_id = ?
           )
       WHERE id = ?`,
      [quizId, quizId]
    );

    return NextResponse.json({ 
      success: true, 
      resultId: resultId.insertId 
    });
  } catch (error) {
    console.error('Error saving quiz result:', error);
    return NextResponse.json(
      { error: 'Failed to save quiz result' },
      { status: 500 }
    );
  }
}
