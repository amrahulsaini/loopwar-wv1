import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import Database from '../../../lib/database';
import { SecurityService } from '../../../lib/security';

// Initialize Gemini AI with new SDK
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY is not set in environment variables');
} else {
  console.log('✅ GEMINI_API_KEY is loaded:', apiKey.substring(0, 10) + '...');
}

const ai = new GoogleGenAI({
  apiKey: apiKey
});

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const auth = SecurityService.authenticateUser(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const topic = searchParams.get('topic');
    const subtopic = searchParams.get('subtopic');
    const sortOrder = searchParams.get('sortOrder');

    if (!category || !topic || !subtopic || !sortOrder) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
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

    // Fetch chat messages
    const messages = await Database.query(
      'SELECT message, response, message_type, created_at FROM ai_chat_messages WHERE user_id = ? AND category = ? AND topic = ? AND subtopic = ? AND sort_order = ? ORDER BY created_at ASC',
      [userId, category, topic, subtopic, sortOrder]
    ) as { message: string; response: string; message_type: string; created_at: string }[];

    return NextResponse.json({ messages });

  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const auth = SecurityService.authenticateUser(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, category, topic, subtopic, sortOrder } = await request.json();

    if (!message || !category || !topic || !subtopic || !sortOrder) {
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

    // Get previous conversation context (last 10 messages)
    const conversationHistory = await Database.query(
      'SELECT message, response, message_type FROM ai_chat_messages WHERE user_id = ? AND category = ? AND topic = ? AND subtopic = ? AND sort_order = ? ORDER BY created_at DESC LIMIT 10',
      [userId, category, topic, subtopic, sortOrder]
    ) as { message: string; response: string; message_type: string }[];

    // Format conversation history for context
    const contextMessages = conversationHistory.reverse().map(msg => {
      if (msg.message_type === 'user') {
        return `Student: ${msg.message}`;
      } else {
        return `LOOPAI: ${msg.response}`;
      }
    }).join('\n');

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

    // Enhanced AI prompt with better structure and personality
    const systemPrompt = `You are LOOPAI, an expert coding tutor for ${subtopicDisplay}. You're helping with Problem #${sortOrder}.

LEARNING CONTEXT:
Category: ${categoryDisplay}
Topic: ${topicDisplay}  
Subtopic: ${subtopicDisplay}
Problem: #${sortOrder}

RESPONSE STYLE:
- Keep responses under 150 words
- Use simple, clear language
- NO asterisks or bullet points
- Use numbered lists (1. 2. 3.) when needed
- Be conversational but professional
- Ask ONE follow-up question per response

TEACHING APPROACH:
- Start with fundamentals if student is new
- Use real-world analogies
- Check understanding before moving forward
- Provide code examples when relevant
- Stay focused on the current topic

CONVERSATION HISTORY:
${contextMessages || 'This is the start of your conversation.'}

STUDENT QUESTION: "${message}"

Respond as LOOPAI with a structured, concise explanation:`;

    // Generate AI response using Gemini 2.0 Flash
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: systemPrompt
    });

    const response = result.text;

    // Save user message to database
    await Database.query(
      'INSERT INTO ai_chat_messages (user_id, category, topic, subtopic, sort_order, message, response, message_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, category, topic, subtopic, sortOrder, message, '', 'user']
    );

    // Save AI response to database
    await Database.query(
      'INSERT INTO ai_chat_messages (user_id, category, topic, subtopic, sort_order, message, response, message_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, category, topic, subtopic, sortOrder, '', response, 'ai']
    );

    return NextResponse.json({ response });

  } catch (error) {
    console.error('Error processing chat message:', error);
    
    // Provide a fallback response if AI fails
    const fallbackResponse = `I'm experiencing some technical difficulties right now. However, I'm here to help you learn! 

Could you tell me:
1. What specific aspect of this topic would you like to understand better?
2. Are you familiar with the basic concepts, or should we start from the fundamentals?

I'll do my best to guide you through this learning journey! 🚀`;

    return NextResponse.json({ 
      response: fallbackResponse,
      error: 'AI service temporarily unavailable'
    });
  }
}
