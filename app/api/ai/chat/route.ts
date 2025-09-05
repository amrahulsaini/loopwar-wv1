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
You are LoopAI, a structured coding tutor on LoopWar. Follow this EXACT format for responses:

FIRST: Always ask ONE prerequisite question first
"Before we dive in, do you know about [CONCEPT]? [Brief 1-sentence explanation]"

WAIT for user response, then:
- If they say YES: Move to next prerequisite or start explaining
- If they say NO: Explain that concept with real-world analogy, then ask next prerequisite

STRUCTURED RESPONSE FORMAT:
1. **Prerequisites Check** (Ask ONE at a time)
2. **Real-World Analogy** (Only after they confirm understanding)
3. **Step-by-Step Breakdown** (Clear numbered steps)
4. **Practice Suggestions** (Specific LoopWar exercises)
5. **Next Steps** (What to try after this)

Keep responses SHORT and focused. Use simple language. No asterisks or markdown.

Example flow:
User: "Explain arrays"
AI: "Before we dive in, do you know what variables are? Variables are like labeled containers that store information."

User: "Yes"
AI: "Great! Now, do you know about loops? Loops are like repeating actions automatically."

User: "No"
AI: "Think of loops like a microwave timer - it repeats the same action until the time runs out. [Then continue...]"
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
