import { NextRequest, NextResponse } from 'next/server';
import Database from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, topic, subtopic, sortOrder } = body;

    if (!category || !topic || !subtopic || sortOrder === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if quiz already exists
    const existingQuiz = await Database.query(
      `SELECT id FROM quizzes 
       WHERE category = ? AND topic = ? AND subtopic = ? AND sort_order = ?`,
      [category, topic, subtopic, sortOrder]
    ) as Array<{ id: number }>;

    if (existingQuiz.length > 0) {
      return NextResponse.json(
        { error: 'Quiz already exists for this topic' },
        { status: 409 }
      );
    }

    // Generate quiz using AI (LoopAI)
    const aiPrompt = `Generate a comprehensive quiz for the topic "${topic}" in the "${category}" category, specifically focusing on "${subtopic}".

    Create 10-15 questions with the following distribution:
    - 5-7 Multiple Choice Questions (MCQ)
    - 2-3 True/False Questions
    - 2-3 Logical Thinking Questions
    - 1-2 Fill in the Blanks Questions

    For each question, provide:
    1. Question text
    2. Question type (mcq, true_false, logical_thinking, fill_blanks)
    3. Options (for MCQ)
    4. Correct answer
    5. Explanation
    6. Difficulty level (easy, medium, hard)
    7. Points (easy: 1 point, medium: 2 points, hard: 3 points)

    Make sure questions are relevant, educational, and progressively challenging.
    Focus on practical understanding and real-world applications.

    Format the response as JSON with the following structure:
    {
      "title": "Quiz Title",
      "description": "Quiz Description",
      "time_limit": 30,
      "questions": [
        {
          "type": "mcq",
          "question": "Question text?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct_answer": "Option A",
          "explanation": "Explanation text",
          "difficulty": "easy",
          "points": 1
        }
      ]
    }`;

    // Call LoopAI service
    const aiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: aiPrompt,
        type: 'quiz_generation'
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('Failed to generate quiz with AI');
    }

    const aiResult = await aiResponse.json();
    let quizData;

    try {
      // Parse AI response (it might be wrapped in markdown code blocks)
      let responseText = aiResult.response || aiResult.message || '';
      
      // Remove markdown code block syntax if present
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      quizData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      
      // Fallback: Create a basic quiz structure
      quizData = {
        title: `${subtopic} Quiz`,
        description: `A comprehensive quiz on ${subtopic} in ${topic}`,
        time_limit: 30,
        questions: [
          {
            type: 'mcq',
            question: `What is a key concept in ${subtopic}?`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correct_answer: 'Option A',
            explanation: 'This is a basic explanation.',
            difficulty: 'medium',
            points: 2
          }
        ]
      };
    }

    // Calculate total points
    const totalPoints = quizData.questions.reduce((sum: number, q: { points?: number }) => sum + (q.points || 1), 0);

    // Insert quiz into database
    const quizResult = await Database.query(
      `INSERT INTO quizzes 
       (title, description, category, topic, subtopic, sort_order, total_points, time_limit, is_ai_generated, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        quizData.title,
        quizData.description,
        category,
        topic,
        subtopic,
        sortOrder,
        totalPoints,
        quizData.time_limit || 30,
        1
      ]
    ) as { insertId: number };

    const quizId = quizResult.insertId;

    // Insert questions
    for (let i = 0; i < quizData.questions.length; i++) {
      const question = quizData.questions[i] as { 
        type: string; 
        question: string; 
        options?: string[]; 
        correct_answer: string | boolean | string[]; 
        explanation?: string; 
        difficulty?: string; 
        points?: number; 
      };
      
      let correctAnswerType = 'string';
      let correctAnswerValue = question.correct_answer;

      if (question.type === 'true_false') {
        correctAnswerType = 'boolean';
        correctAnswerValue = String(question.correct_answer);
      } else if (question.type === 'fill_blanks' && Array.isArray(question.correct_answer)) {
        correctAnswerType = 'json';
        correctAnswerValue = JSON.stringify(question.correct_answer);
      }

      await Database.query(
        `INSERT INTO quiz_questions 
         (quiz_id, question_type, question_text, options, correct_answer, correct_answer_type, explanation, difficulty, points, question_order) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          quizId,
          question.type,
          question.question,
          question.options ? JSON.stringify(question.options) : null,
          correctAnswerValue,
          correctAnswerType,
          question.explanation || '',
          question.difficulty || 'medium',
          question.points || 1,
          i + 1
        ]
      );
    }

    // Return the created quiz
    const createdQuiz = {
      id: quizId,
      title: quizData.title,
      description: quizData.description,
      category,
      topic,
      subtopic,
      sort_order: sortOrder,
      total_points: totalPoints,
      time_limit: quizData.time_limit || 30,
      is_ai_generated: true,
      created_at: new Date().toISOString(),
      questions: quizData.questions.map((q: { 
        type: string; 
        question: string; 
        options?: string[]; 
        correct_answer: string | boolean | string[]; 
        explanation?: string; 
        difficulty?: string; 
        points?: number; 
      }, index: number) => ({
        id: `temp_${index}`,
        type: q.type,
        question: q.question,
        options: q.options || null,
        correct_answer: q.correct_answer,
        explanation: q.explanation || '',
        difficulty: q.difficulty || 'medium',
        points: q.points || 1
      }))
    };

    return NextResponse.json(createdQuiz);
  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}
