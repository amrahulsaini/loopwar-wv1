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
You are LoopAI, a direct and helpful coding tutor on LoopWar platform. Be concise, practical, and educational.

KEY RULES:
- Always know the current problem from context
- Ask about prerequisites first (arrays, loops, etc.)
- Use real-world analogies to explain concepts
- Guide students through learning progression
- Suggest MCQs and practice problems
- Keep responses short and actionable
- No asterisks or markdown formatting
- Be conversational but focused on learning

When explaining problems:
1. Assess what user already knows
2. Teach concepts with analogies
3. Break down the problem step-by-step
4. Suggest practice exercises
5. Guide to related problems on the platform

Remember: You're on LoopWar - reference the platform's features naturally.
`;

interface ChatRequest {
  user_id: number;
  message: string;
  conversation_id?: number;
  context?: string;
  problem_id?: number;
  problem_title?: string;
  problem_description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { user_id, message, conversation_id, context, problem_id, problem_title, problem_description } = body;

    console.log('AI Chat API Request:', { user_id, message: message.substring(0, 100), conversation_id, context, problem_id });

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
        currentConversationId = (result as mysql.ResultSetHeader).insertId;
      }

      // Get conversation history
      const [historyRows] = await connection.execute(
        'SELECT user_message, ai_response FROM ai_messages WHERE conversation_id = ? ORDER BY created_at ASC',
        [currentConversationId]
      );

      // Prepare messages for Gemini
      let enhancedPrompt = SYSTEM_PROMPT;

      // Add problem context if available
      if (problem_title && problem_description) {
        enhancedPrompt += `\n\nCURRENT PROBLEM:\nTitle: ${problem_title}\nDescription: ${problem_description}\n\nThe user is asking about this specific problem. Provide targeted help based on this context.`;
      } else if (context) {
        enhancedPrompt += `\n\nCURRENT CONTEXT: ${context}`;
      }

      const messages = [
        { role: 'user', parts: [{ text: enhancedPrompt }] }
      ];

      // Add conversation history
      for (const row of historyRows as mysql.RowDataPacket[]) {
        messages.push({ role: 'user', parts: [{ text: row.user_message }] });
        messages.push({ role: 'model', parts: [{ text: row.ai_response }] });
      }

      // Add current message
      messages.push({ role: 'user', parts: [{ text: message }] });

      // Generate AI response
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const chat = model.startChat({
        history: messages.slice(0, -1).map(msg => ({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: msg.parts
        }))
      });

      const result = await chat.sendMessage(message);
      const aiResponse = result.response.text();

      console.log('AI Response generated:', aiResponse.substring(0, 100) + '...');

      // Save to database
      await connection.execute(
        'INSERT INTO ai_messages (conversation_id, user_id, user_message, ai_response, created_at) VALUES (?, ?, ?, ?, NOW())',
        [currentConversationId, user_id, message, aiResponse]
      );

      console.log('Message saved to database');

      // Update conversation timestamp
      await connection.execute(
        'UPDATE ai_conversations SET updated_at = NOW() WHERE id = ?',
        [currentConversationId]
      );

      console.log('Conversation updated');

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
