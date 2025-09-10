import { NextRequest, NextResponse } from 'next/server';
import Database from '@/lib/database';

// GET /api/quiz/[category]/[topic]/[subtopic]/[sortOrder]
export async function GET(
  request: NextRequest,
  { params }: { params: { category: string; topic: string; subtopic: string; sortOrder: string } }
) {
  try {
    const { category, topic, subtopic, sortOrder } = params;

    // First, check if quiz exists
    const quizRows = await Database.query(
      `SELECT q.*, COUNT(qq.id) as question_count 
       FROM quizzes q 
       LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id 
       WHERE q.category = ? AND q.topic = ? AND q.subtopic = ? AND q.sort_order = ?
       GROUP BY q.id`,
      [category, topic, subtopic, parseInt(sortOrder)]
    ) as any[];

    if (!quizRows || quizRows.length === 0) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const quiz = quizRows[0];

    // Fetch quiz questions
    const questionRows = await Database.query(
      `SELECT * FROM quiz_questions 
       WHERE quiz_id = ? 
       ORDER BY question_order`,
      [quiz.id]
    ) as any[];

    const quizData = {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      topic: quiz.topic,
      subtopic: quiz.subtopic,
      sort_order: quiz.sort_order,
      total_points: quiz.total_points,
      time_limit: quiz.time_limit,
      created_at: quiz.created_at,
      is_ai_generated: quiz.is_ai_generated,
      questions: questionRows.map((q: any) => ({
        id: q.id,
        type: q.question_type,
        question: q.question_text,
        options: q.options ? JSON.parse(q.options) : null,
        correct_answer: q.correct_answer_type === 'json' ? JSON.parse(q.correct_answer) : 
                       q.correct_answer_type === 'boolean' ? q.correct_answer === 'true' : 
                       q.correct_answer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        points: q.points
      }))
    };

    return NextResponse.json(quizData);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    );
  }
}
