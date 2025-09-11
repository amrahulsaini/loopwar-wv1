import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import Database from '../../../../lib/database';
import { SecurityService } from '../../../../lib/security';

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const auth = SecurityService.authenticateUser(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category, topic, subtopic, sortOrder } = await request.json();

    if (!category || !topic || !subtopic || sortOrder === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify user exists (for authentication purposes)
    const userResult = await Database.query(
      'SELECT id FROM users WHERE username = ?',
      [auth.username]
    ) as { id: number }[];

    if (!userResult || userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Format display names for better context
    const formatDisplayName = (urlName: string) => {
      return urlName
        .replace(/-/g, ' ')
        .replace(/and/g, '&')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const categoryDisplay = formatDisplayName(category);
    const topicDisplay = formatDisplayName(topic);
    const subtopicDisplay = formatDisplayName(subtopic);

    // Generate quiz using AI directly
    const quizPrompt = `You are a quiz generation expert. Create a comprehensive 10-question multiple choice quiz for: ${categoryDisplay} → ${topicDisplay} → ${subtopicDisplay}

IMPORTANT: Your response MUST be ONLY valid JSON with no additional text, markdown, or explanation.

Generate a quiz with this EXACT JSON structure:
{
  "title": "Quiz Title Here",
  "description": "Brief quiz description",
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}

Requirements:
- Exactly 10 questions
- Mix of difficulty: 3 easy, 4 medium, 3 hard
- Each question has exactly 4 options
- "correct" field is index (0-3) of correct option
- Include detailed explanations
- Focus on practical understanding and key concepts
- Questions should test comprehension, not just memorization

RESPOND WITH ONLY THE JSON OBJECT - NO OTHER TEXT!`;

    console.log('Generating quiz with AI for:', categoryDisplay, '→', topicDisplay, '→', subtopicDisplay);

    // Generate quiz using Gemini AI directly
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: quizPrompt
    });

    const aiResponse = result.text || '';
    console.log('Raw AI Response:', aiResponse.substring(0, 200) + '...');

    // Clean up the response to extract JSON
    let quizData;
    try {
      // Remove markdown code blocks if present
      let jsonString = aiResponse.replace(/```json\s*|\s*```/g, '').trim();
      
      // Find JSON object in the response
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }
      
      quizData = JSON.parse(jsonString);
      console.log('Parsed quiz data:', { title: quizData.title, questionsCount: quizData.questions?.length });
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.log('AI Response for debugging:', aiResponse);
      return NextResponse.json({ error: 'Failed to parse quiz data from AI' }, { status: 500 });
    }

    // Validate quiz data structure
    if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
      console.error('Invalid quiz structure:', quizData);
      return NextResponse.json({ error: 'AI generated invalid quiz structure' }, { status: 500 });
    }

    // Save quiz to database
    const quizInsertResult = await Database.query(
      'INSERT INTO quizzes (category, topic, subtopic, sort_order, title, description, total_points, time_limit, is_ai_generated, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [category, topic, subtopic, sortOrder, quizData.title || 'Generated Quiz', quizData.description || 'AI Generated Quiz', quizData.questions.length * 2, 30, 1]
    ) as { insertId: number };

    const quizId = quizInsertResult.insertId;

    // Save questions
    let savedQuestions = 0;
    for (let i = 0; i < quizData.questions.length; i++) {
      const question = quizData.questions[i];
      
      if (!question.question || !question.options || !Array.isArray(question.options) || question.options.length !== 4) {
        console.warn(`Skipping invalid question at index ${i}:`, question);
        continue;
      }

      await Database.query(
        'INSERT INTO quiz_questions (quiz_id, question_type, question_text, options, correct_answer, explanation, difficulty, points, question_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          quizId,
          'mcq',
          question.question,
          JSON.stringify(question.options),
          question.options[question.correct] || question.options[0],
          question.explanation || '',
          'medium',
          2,
          i + 1
        ]
      );
      savedQuestions++;
    }

    console.log(`Quiz generated successfully: ${savedQuestions} questions saved`);

    return NextResponse.json({ 
      success: true, 
      quizId,
      message: 'Quiz generated successfully!',
      questionsCount: savedQuestions
    });

  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
