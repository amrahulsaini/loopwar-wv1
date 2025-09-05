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

// Enhanced educational system prompt for learning workspace
const SYSTEM_PROMPT = `
You are LoopAI, an expert coding tutor and mentor on LoopWar. You are a concise, precise, and highly educational AI assistant designed specifically for helping students learn programming concepts step by step.

CURRENT LEARNING CONTEXT:
- Problem: {PROBLEM_TITLE}
- Description: {PROBLEM_DESCRIPTION}
- Category: {CATEGORY}
- Topic: {TOPIC}
- Subtopic: {SUBTOPIC}

CORE TEACHING PRINCIPLES:
1. **Short & Precise**: Keep responses under 150 words unless specifically asked for detailed explanations
2. **Step-by-Step Learning**: Break complex concepts into digestible pieces
3. **Prerequisites First**: Always check if students understand prerequisites before teaching new concepts
4. **Interactive Learning**: Ask questions and use yes/no prompts to gauge understanding
5. **Real-World Analogies**: Use simple analogies to explain complex programming concepts
6. **Socratic Method**: Guide students to discover answers rather than just giving them

RESPONSE STYLE:
- Use bullet points and numbered lists
- Bold **key concepts** 
- Include relevant emojis for engagement
- End with a follow-up question or next step
- Provide practical examples when needed

TEACHING ACTIONS YOU CAN TAKE:
- explain_concept: Provide detailed explanation of the current topic
- check_prerequisites: Ask about foundational knowledge needed
- show_approach: Guide through solution methodology
- teach_prerequisites: Explain missing foundational concepts
- show_examples: Provide concrete code examples
- practice_problems: Suggest related practice exercises

PREREQUISITE CHECKING:
When checking prerequisites, ask about ONE concept at a time:
"Before we dive into {CURRENT_CONCEPT}, do you understand {PREREQUISITE_CONCEPT}?"

LEARNING WORKSPACE FEATURES:
- Your responses automatically update the student's notes
- Students can edit and save concepts in real-time
- Focus on building a comprehensive understanding
- Create a VS Code-like learning experience

Remember: You're not just answering questions - you're building a complete learning experience. Guide students through concepts like a patient mentor would.
`;

interface ChatRequest {
  user_id: number;
  message: string;
  conversation_id?: number;
  context?: string;
  problem_id?: number;
  problem_title?: string;
  action?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { user_id, message, conversation_id, context, problem_id, problem_title, action } = body;

    console.log('AI Chat API Request:', { user_id, message: message.substring(0, 100), conversation_id, context, problem_id, action });

    if (!user_id || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id and message' },
        { status: 400 }
      );
    }

    // Get database connection
    const connection = await mysql.createConnection(dbConfig);

    try {
    let currentSessionId = conversation_id;

    // Create new chat session if none exists
    if (!currentSessionId) {
      const [result] = await connection.execute(
        'INSERT INTO ai_chat_sessions (user_id, session_name, problem_id, category_id, topic_id, subtopic_id, created_at, last_message_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [user_id, `Problem: ${problem_title || 'General Discussion'}`, problem_id || null, null, null, null]
      );
      currentSessionId = (result as mysql.ResultSetHeader).insertId;
    }

    // Get chat session history
    const [historyRows] = await connection.execute(
      'SELECT content, message_type FROM ai_chat_messages WHERE session_id = ? AND message_type IN ("user_text", "ai_response") ORDER BY created_at ASC',
      [currentSessionId]
    );      // Prepare messages for Gemini
      let enhancedPrompt = SYSTEM_PROMPT;

      // Fetch problem-specific data to enhance AI responses
      let problemContext = '';
      if (problem_id) {
        try {
          const [problemDetails] = await connection.execute(`
            SELECT 
              p.title,
              p.description,
              p.difficulty,
              p.solution_hints,
              p.time_complexity,
              p.space_complexity,
              c.name as category_name,
              t.name as topic_name,
              s.name as subtopic_name,
              GROUP_CONCAT(pp.prerequisite_concept) as prerequisites
            FROM problems p
            LEFT JOIN subtopics s ON p.subtopic_id = s.id
            LEFT JOIN topics t ON s.topic_id = t.id
            LEFT JOIN categories c ON t.category_id = c.id
            LEFT JOIN problem_prerequisites pp ON p.id = pp.problem_id
            WHERE p.id = ? AND p.is_active = TRUE
            GROUP BY p.id
          `, [problem_id]);

          if ((problemDetails as mysql.RowDataPacket[]).length > 0) {
            const details = (problemDetails as mysql.RowDataPacket[])[0];
            problemContext = `
**PROBLEM DETAILS:**
- Title: ${details.title}
- Description: ${details.description}
- Difficulty: ${details.difficulty}
- Time Complexity: ${details.time_complexity || 'Not specified'}
- Space Complexity: ${details.space_complexity || 'Not specified'}
- Prerequisites: ${details.prerequisites || 'None specified'}
- Solution Hints: ${details.solution_hints || 'No hints available'}
`;
            
            // Update placeholders with actual data
            enhancedPrompt = enhancedPrompt
              .replace('{PROBLEM_TITLE}', details.title)
              .replace('{PROBLEM_DESCRIPTION}', details.description)
              .replace('{CATEGORY}', details.category_name)
              .replace('{TOPIC}', details.topic_name)
              .replace('{SUBTOPIC}', details.subtopic_name);
          }
        } catch (error) {
          console.error('Failed to fetch problem details:', error);
        }
      }

      if (!problemContext) {
        // Use generic context if no problem data
        enhancedPrompt = enhancedPrompt
          .replace('{PROBLEM_TITLE}', 'General Discussion')
          .replace('{PROBLEM_DESCRIPTION}', 'General coding discussion')
          .replace('{CATEGORY}', 'General')
          .replace('{TOPIC}', 'General')
          .replace('{SUBTOPIC}', 'General');
      }

      // Add problem context to prompt
      enhancedPrompt += problemContext;

      // Enhanced prompt based on action type
      if (action === 'explain_concept') {
        enhancedPrompt += `\n\n**USER ACTION: EXPLAIN CONCEPT**
Please provide a clear, step-by-step explanation of the main concept in this problem. Keep it under 150 words and ask if they understand prerequisites first.`;
      } else if (action === 'check_prerequisites') {
        enhancedPrompt += `\n\n**USER ACTION: CHECK PREREQUISITES**
Ask about ONE foundational concept at a time that's needed for this problem. Use yes/no buttons for easy interaction.`;
      } else if (action === 'show_approach') {
        enhancedPrompt += `\n\n**USER ACTION: SHOW APPROACH**
Guide them through the solution methodology step by step. Focus on the thinking process, not just the code.`;
      } else if (action === 'teach_prerequisites') {
        enhancedPrompt += `\n\n**USER ACTION: TEACH PREREQUISITES**
The student doesn't know the prerequisites. Teach them the foundational concept they need first, then connect it to the main problem.`;
      } else if (action === 'knows_prerequisites') {
        enhancedPrompt += `\n\n**USER ACTION: KNOWS PREREQUISITES**
Great! The student knows the prerequisites. Now explain the main concept building upon their existing knowledge.`;
      } else if (action === 'show_examples') {
        enhancedPrompt += `\n\n**USER ACTION: SHOW EXAMPLES**
Provide 1-2 concrete examples that illustrate the concept. Make them simple and relatable.`;
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

      // Add current message with special handling for actions
      let finalMessage = message;
      
      // Special handling for "explain_concept" action
      if (action === 'explain_concept') {
        finalMessage = `The user clicked "Explain me this concept" for the problem: ${problem_title}. 

IMPORTANT: Before explaining this concept, you MUST:
1. Ask about ONE prerequisite concept at a time using yes/no questions
2. For example: "Before I explain ${problem_title || 'this concept'}, do you understand [PREREQUISITE]?"
3. Wait for their response before proceeding
4. Keep your response SHORT (2-3 sentences max)
5. Focus on the fundamentals they need to know first

Original user message: ${message}`;
      }

      messages.push({ role: 'user', parts: [{ text: finalMessage }] });

      // Generate AI response
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const chat = model.startChat({
        history: messages.slice(0, -1).map(msg => ({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: msg.parts
        }))
      });

      const result = await chat.sendMessage(finalMessage);
      const aiResponse = result.response.text();

      console.log('AI Response generated:', aiResponse.substring(0, 100) + '...');

      // Save user message to new chat system
      await connection.execute(
        'INSERT INTO ai_chat_messages (session_id, user_id, message_type, content, created_at) VALUES (?, ?, ?, ?, NOW())',
        [currentSessionId, user_id, 'user_text', message]
      );

      // Save AI response to new chat system
      await connection.execute(
        'INSERT INTO ai_chat_messages (session_id, user_id, message_type, content, created_at) VALUES (?, ?, ?, ?, NOW())',
        [currentSessionId, user_id, 'ai_response', aiResponse]
      );

      // Update session timestamp
      await connection.execute(
        'UPDATE ai_chat_sessions SET last_message_at = NOW(), updated_at = NOW() WHERE id = ?',
        [currentSessionId]
      );

      return NextResponse.json({
        session_id: currentSessionId,
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
