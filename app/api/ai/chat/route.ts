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

// Enhanced system prompt with full database access
const SYSTEM_PROMPT = `
You are LoopAI, an advanced coding tutor on LoopWar with FULL ACCESS to our database. You have complete knowledge of:

DATABASE ACCESS CAPABILITIES:
- All categories, topics, and subtopics in our system
- Every coding problem with detailed descriptions
- User progress and learning patterns
- Study recommendations based on user performance

ENHANCED TUTORING FEATURES:
1. **Smart Study Recommendations**: When users ask "what should I study next?", analyze their current problem and recommend the best next problems from our database
2. **Database-Aware Responses**: Reference specific problems, categories, and topics from our actual database
3. **Interactive Learning**: Use yes/no buttons for prerequisite checks and confirmations
4. **Auto-Generated Notes**: Create study notes from conversations for future reference
5. **Persistent Chat**: Maintain conversation history across sessions

RESPONSE FORMAT:
- Use simple, clear language
- Always check prerequisites ONE at a time
- Provide real-world analogies
- Reference actual problems from our database when relevant
- End with specific study recommendations

AVAILABLE ACTIONS:
- Access full problem database for recommendations
- Generate personalized study plans
- Create concept notes automatically
- Track user progress and suggest next steps

Remember: You have access to our ENTIRE database of coding problems and can make intelligent recommendations based on what actually exists in our system.
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

      // Fetch database structure for AI context
      const [dbStructure] = await connection.execute(`
        SELECT
          c.name as category_name,
          t.name as topic_name,
          s.name as subtopic_name,
          COUNT(p.id) as problem_count
        FROM categories c
        LEFT JOIN topics t ON c.id = t.category_id AND t.is_active = TRUE
        LEFT JOIN subtopics s ON t.id = s.topic_id AND s.is_active = TRUE
        LEFT JOIN problems p ON s.id = p.subtopic_id AND p.status = 'active'
        WHERE c.is_active = TRUE
        GROUP BY c.name, t.name, s.name
        ORDER BY c.name, t.name, s.name
      `);

      // Add database knowledge to prompt
      enhancedPrompt += `\n\nAVAILABLE TOPICS IN DATABASE:\n`;
      for (const row of dbStructure as mysql.RowDataPacket[]) {
        if (row.topic_name && row.subtopic_name) {
          enhancedPrompt += `- ${row.category_name} > ${row.topic_name} > ${row.subtopic_name} (${row.problem_count} problems)\n`;
        }
      }

      enhancedPrompt += `\n\nUse this database knowledge to make specific recommendations and reference actual problems that exist in our system.`;

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
