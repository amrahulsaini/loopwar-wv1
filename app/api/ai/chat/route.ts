import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Gemini AI setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// System prompt
const SYSTEM_PROMPT = `
You are LoopAI, an advanced AI tutor for the LoopWar coding platform. Your role is to help users learn programming concepts through interactive, personalized tutoring.

Key guidelines:
- Be friendly, patient, and encouraging
- Explain concepts clearly with examples
- Adapt your explanations based on user knowledge level
- Use code examples when relevant
- Guide users toward understanding rather than giving direct answers
- Relate concepts to real-world applications
- Encourage best practices and problem-solving skills

Remember: You're part of LoopWar, so reference the platform's features when appropriate.
`;

interface ChatRequest {
  user_id: number;
  message: string;
  conversation_id?: number;
  context?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { user_id, message, conversation_id, context } = body;

    if (!user_id || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id and message' },
        { status: 400 }
      );
    }

    // Get database connection
    const connection = await mysql.createConnection(dbConfig);

    try {
      let currentConversationId = conversation_id;

      // Create new conversation if none exists
      if (!currentConversationId) {
        const [result] = await connection.execute(
          'INSERT INTO ai_conversations (user_id, context, created_at) VALUES (?, ?, NOW())',
          [user_id, context || null]
        );
        currentConversationId = (result as any).insertId;
      }

      // Get conversation history
      const [historyRows] = await connection.execute(
        'SELECT user_message, ai_response FROM ai_messages WHERE conversation_id = ? ORDER BY created_at ASC',
        [currentConversationId]
      );

      // Prepare messages for Gemini
      const messages = [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT }] }
      ];

      // Add conversation history
      for (const row of historyRows as any[]) {
        messages.push({ role: 'user', parts: [{ text: row.user_message }] });
        messages.push({ role: 'model', parts: [{ text: row.ai_response }] });
      }

      // Add current message
      messages.push({ role: 'user', parts: [{ text: message }] });

      // Generate AI response
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: message }] }],
        systemInstruction: SYSTEM_PROMPT,
        history: messages.slice(0, -1).map(msg => ({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: msg.parts
        }))
      });

      const aiResponse = result.response.text();

      // Save to database
      await connection.execute(
        'INSERT INTO ai_messages (conversation_id, user_id, user_message, ai_response, created_at) VALUES (?, ?, ?, ?, NOW())',
        [currentConversationId, user_id, message, aiResponse]
      );

      // Update conversation timestamp
      await connection.execute(
        'UPDATE ai_conversations SET updated_at = NOW() WHERE id = ?',
        [currentConversationId]
      );

      return NextResponse.json({
        conversation_id: currentConversationId,
        response: aiResponse,
        timestamp: new Date().toISOString()
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('AI Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json(
      { error: 'Missing user_id parameter' },
      { status: 400 }
    );
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    try {
      const [rows] = await connection.execute(
        'SELECT id, context, created_at, updated_at FROM ai_conversations WHERE user_id = ? ORDER BY updated_at DESC',
        [userId]
      );

      return NextResponse.json({ conversations: rows });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Get Conversations API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
