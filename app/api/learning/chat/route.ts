import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { GoogleGenerativeAI } from '@google/generative-ai';

const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, message, promptType, problemData, conversationHistory } = body;

    if (!sessionId || !message || !problemData) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const db = await connection;

    // Fetch related problems and context from database
    const [relatedProblems] = await db.execute(`
      SELECT title, description, difficulty 
      FROM problems 
      WHERE category_id = ? AND topic_id = ? AND subtopic_id = ?
      ORDER BY sort_order
      LIMIT 10
    `, [problemData.category_id || 1, problemData.topic_id || 1, problemData.subtopic_id || 1]);

    const [prerequisites] = await db.execute(`
      SELECT DISTINCT t2.name as topic_name, st2.name as subtopic_name
      FROM problems p1
      JOIN problems p2 ON p2.sort_order < p1.sort_order
      JOIN topics t2 ON p2.topic_id = t2.id
      JOIN subtopics st2 ON p2.subtopic_id = st2.id
      WHERE p1.id = ?
      ORDER BY p2.sort_order DESC
      LIMIT 5
    `, [problemData.id]);

    // Build context for AI
    const systemPrompt = `You are LoopAI, an expert programming tutor specializing in Data Structures and Algorithms. You are helping a student learn about: "${problemData.title}" (${problemData.difficulty} difficulty).

CURRENT PROBLEM CONTEXT:
- Title: ${problemData.title}
- Description: ${problemData.description}
- Difficulty: ${problemData.difficulty}
- Topic: ${problemData.topic_name}
- Subtopic: ${problemData.subtopic_name}

RELATED PROBLEMS IN THIS TOPIC:
${(relatedProblems as Array<{title: string; description: string; difficulty: string}>).map(p => `- ${p.title} (${p.difficulty}): ${p.description.substring(0, 100)}...`).join('\n')}

PREREQUISITE TOPICS:
${(prerequisites as Array<{topic_name: string; subtopic_name: string}>).map(p => `- ${p.topic_name}: ${p.subtopic_name}`).join('\n')}

YOUR ROLE:
1. Be a conversational AI tutor - friendly, encouraging, and precise
2. Before explaining complex concepts, ask if they know prerequisites
3. Provide structured, short responses with clear sections
4. Use real-world analogies when helpful
5. Suggest practice problems from our database when relevant
6. Generate structured notes in your responses (definitions, concepts, examples)

RESPONSE FORMAT:
- Keep responses concise but comprehensive
- Use bullet points and clear structure
- When explaining algorithms, break them into steps
- Always relate back to the current problem
- Ask follow-up questions to guide learning

CURRENT PROMPT TYPE: ${promptType || 'general_question'}

Remember: You have access to our entire problem database and can suggest specific problems by name. Always be encouraging and adaptive to the student's level.`;

    // Build conversation context
    const conversationContext = conversationHistory.map((msg: {type: string; content: string}) => 
      `${msg.type === 'user' ? 'Student' : 'LoopAI'}: ${msg.content}`
    ).join('\n\n');

    const fullPrompt = `${systemPrompt}

CONVERSATION HISTORY:
${conversationContext}

CURRENT STUDENT MESSAGE: ${message}

Respond as LoopAI - be helpful, structured, and conversational. If this is a specific prompt type like "real_life_analogy" or "prerequisites", focus your response accordingly.`;

    // Generate AI response
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(fullPrompt);
    const aiResponse = result.response.text();

    // Extract potential notes from AI response for structured learning
    const notes = extractNotesFromResponse(aiResponse);

    // Save notes to database if any were generated
    if (notes.length > 0) {
      for (const note of notes) {
        await db.execute(`
          INSERT INTO ai_generated_notes 
          (session_id, note_type, title, content, order_index, is_important)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [sessionId, note.type, note.title, note.content, note.orderIndex, note.isImportant]);
      }
    }

    // Update session activity
    await db.execute(`
      UPDATE learning_sessions 
      SET last_activity = CURRENT_TIMESTAMP, total_messages = total_messages + 2
      WHERE id = ?
    `, [sessionId]);

    return NextResponse.json({
      success: true,
      message: aiResponse,
      notes: notes.map(note => ({
        id: Date.now() + Math.random(),
        type: note.type,
        title: note.title,
        content: note.content,
        isImportant: note.isImportant
      }))
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    );
  }
}

function extractNotesFromResponse(response: string) {
  const notes: Array<{
    type: string;
    title: string;
    content: string;
    orderIndex: number;
    isImportant: boolean;
  }> = [];
  let orderIndex = 0;

  // Simple extraction logic - in a real implementation, you might use more sophisticated NLP
  const lines = response.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for definition patterns
    if (line.includes('Definition:') || line.includes('**Definition')) {
      const title = line.replace(/\*\*/g, '').replace('Definition:', '').trim();
      const content = lines[i + 1]?.trim() || title;
      if (title && content) {
        notes.push({
          type: 'definition',
          title: title,
          content: content,
          orderIndex: orderIndex++,
          isImportant: true
        });
      }
    }
    
    // Look for concept patterns
    if (line.includes('Key Concept:') || line.includes('**Key Concept')) {
      const title = line.replace(/\*\*/g, '').replace('Key Concept:', '').trim();
      const content = lines[i + 1]?.trim() || title;
      if (title && content) {
        notes.push({
          type: 'concept',
          title: title,
          content: content,
          orderIndex: orderIndex++,
          isImportant: true
        });
      }
    }
    
    // Look for example patterns
    if (line.includes('Example:') || line.includes('**Example')) {
      const title = line.replace(/\*\*/g, '').replace('Example:', '').trim();
      const content = lines[i + 1]?.trim() || title;
      if (title && content) {
        notes.push({
          type: 'example',
          title: title,
          content: content,
          orderIndex: orderIndex++,
          isImportant: false
        });
      }
    }
    
    // Look for analogy patterns
    if (line.includes('Analogy:') || line.includes('Real-world analogy:') || line.includes('**Analogy')) {
      const title = line.replace(/\*\*/g, '').replace(/.*Analogy:/, 'Real-world Analogy').trim();
      const content = lines[i + 1]?.trim() || title;
      if (title && content) {
        notes.push({
          type: 'analogy',
          title: title,
          content: content,
          orderIndex: orderIndex++,
          isImportant: false
        });
      }
    }
  }

  return notes;
}
