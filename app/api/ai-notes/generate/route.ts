import { NextRequest, NextResponse } from 'next/server';
import { SecurityService } from '../../../../lib/security';
import Database from '../../../../lib/database';
import { GoogleGenAI } from '@google/genai';

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

    // Get user ID
    const userResult = await Database.query(
      'SELECT id FROM users WHERE username = ?',
      [auth.username]
    ) as { id: number }[];

    if (!userResult || userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userResult[0].id;

    // Get the entire conversation history
    const conversationHistory = await Database.query(
      'SELECT message, response, message_type, created_at FROM ai_chat_messages WHERE user_id = ? AND category = ? AND topic = ? AND subtopic = ? AND sort_order = ? ORDER BY created_at ASC',
      [userId, category, topic, subtopic, sortOrder]
    ) as { message: string; response: string; message_type: string; created_at: string }[];

    if (conversationHistory.length === 0) {
      return NextResponse.json({ error: 'No conversation found' }, { status: 404 });
    }

    // Format conversation for AI analysis
    const conversationText = conversationHistory.map(msg => {
      if (msg.message_type === 'user') {
        return `Student: ${msg.message}`;
      } else {
        return `AI: ${msg.response}`;
      }
    }).join('\n\n');

    // Enhanced AI prompt for intelligent note extraction
    const analysisPrompt = `You are an expert learning analyst. Analyze this entire coding conversation and extract structured learning notes.

CONVERSATION TOPIC: ${category} > ${topic} > ${subtopic} (Problem #${sortOrder})

CONVERSATION:
${conversationText}

INSTRUCTIONS:
Extract and organize the learning content into these categories:

1. DEFINITIONS: Key programming terms and concepts explained
2. ANALOGIES: Real-world comparisons that help understand concepts
3. KEY_INSIGHTS: Important programming principles, best practices, and "aha moments"
4. EXAMPLES: Code snippets, algorithms, or practical demonstrations
5. LEARNING_PATH: The progression of understanding shown in this conversation
6. CONNECTIONS: How this topic relates to other programming concepts

Format your response as a JSON object with this exact structure:
{
  "definitions": [{"term": "string", "definition": "string"}],
  "analogies": [{"concept": "string", "analogy": "string"}],
  "key_insights": ["string"],
  "examples": [{"concept": "string", "example": "string"}],
  "learning_path": ["string"],
  "connections": ["string"],
  "conversation_summary": "string"
}

Focus on:
- Extracting genuine learning moments from the conversation
- Identifying the student's learning progression
- Capturing explanations that would be valuable for future review
- Connecting concepts to broader programming knowledge

Be comprehensive but avoid redundancy. Only include high-quality, educational content.`;

    // Generate enhanced notes using AI
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: analysisPrompt
    });

    const analysisResult = result.text || '{}';
    
    // Try to parse the JSON response
    let extractedContent;
    try {
      // Clean the response to extract JSON
      const jsonMatch = analysisResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback to empty structure
      extractedContent = {
        definitions: [],
        analogies: [],
        key_insights: [],
        examples: [],
        learning_path: [],
        connections: [],
        conversation_summary: "Analysis completed but content extraction encountered an issue."
      };
    }

    // Save or update notes in database
    const existingNotes = await Database.query(
      'SELECT * FROM ai_learning_notes WHERE user_id = ? AND category = ? AND topic = ? AND subtopic = ? AND sort_order = ?',
      [userId, category, topic, subtopic, sortOrder]
    ) as Array<Record<string, unknown>>;

    if (existingNotes.length > 0) {
      // Update existing notes
      await Database.query(
        `UPDATE ai_learning_notes SET 
          definitions = ?, analogies = ?, key_insights = ?, examples = ?,
          learning_path = ?, connections = ?, conversation_summary = ?,
          conversation_context = ?, last_ai_update = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          JSON.stringify(extractedContent.definitions || []),
          JSON.stringify(extractedContent.analogies || []),
          JSON.stringify(extractedContent.key_insights || []),
          JSON.stringify(extractedContent.examples || []),
          JSON.stringify(extractedContent.learning_path || []),
          JSON.stringify(extractedContent.connections || []),
          extractedContent.conversation_summary || '',
          conversationText.substring(0, 1000) + '...', // Store conversation context
          (existingNotes[0].id as number)
        ]
      );
    } else {
      // Create new notes
      await Database.query(
        `INSERT INTO ai_learning_notes 
          (user_id, category, topic, subtopic, sort_order, definitions, analogies, key_insights, examples, learning_path, connections, conversation_summary, conversation_context)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          category,
          topic,
          subtopic,
          sortOrder,
          JSON.stringify(extractedContent.definitions || []),
          JSON.stringify(extractedContent.analogies || []),
          JSON.stringify(extractedContent.key_insights || []),
          JSON.stringify(extractedContent.examples || []),
          JSON.stringify(extractedContent.learning_path || []),
          JSON.stringify(extractedContent.connections || []),
          extractedContent.conversation_summary || '',
          conversationText.substring(0, 1000) + '...'
        ]
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Learning notes generated successfully!',
      extractedContent 
    });

  } catch (error) {
    console.error('Error generating enhanced notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
