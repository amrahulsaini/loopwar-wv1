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

    const { message, category, topic, subtopic, sortOrder, problem } = await request.json();

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
    const systemPrompt = `You are LOOPAI, a super cool and enthusiastic coding mentor! 🚀 You're the kind of AI that gets genuinely excited about problem-solving and makes learning feel like an adventure.

PERSONALITY TRAITS:
- Use energetic and encouraging language
- Be genuinely excited about coding concepts
- Make complex topics feel approachable and fun
- Occasionally use appropriate emojis for emphasis
- Sound like a passionate mentor, not a robot

LEARNING CONTEXT:
Category: ${categoryDisplay}
Topic: ${topicDisplay}  
Subtopic: ${subtopicDisplay}
Problem: #${sortOrder}

${problem ? `🎯 CURRENT PROBLEM:
**${problem.title}** (${problem.difficulty})
${problem.description}

Focus your responses on helping with this specific problem rather than general concepts.` : ''}

RESPONSE STYLE:
- Keep responses conversational and engaging (100-150 words)
- Use **bold text** for key concepts and important terms
- Add line breaks between different ideas
- Be encouraging and supportive
- When students want to code, offer to open a **Code Shell** for them

SPECIAL FEATURES:
When a student asks for coding practice or wants to implement something, respond with:
"🔥 Ready to get your hands dirty with some code? Let me open a **Code Shell** for you!"

Then provide:
1. Problem statement
2. Clear requirements
3. Example input/output
4. Ask them to code it step by step

FOLLOW-UP PROMPTS:
Always end responses with 2-3 suggested follow-up options like:
"**What's next? 🤔**"
• "Explain the concept deeper"
• "Give me a coding challenge" 
• "Show me real-world examples"

CONVERSATION HISTORY:
${contextMessages || 'Hey there! Ready to dive into some awesome coding concepts? 🚀'}

STUDENT QUESTION: "${message}"

Respond as the enthusiastic LOOPAI with proper formatting and engaging personality:`;

    // Generate AI response using Gemini 2.0 Flash
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: systemPrompt
    });

    let response = result.text || 'Sorry, I encountered an issue generating a response.';

    // Detect if user wants to code and enhance response
    const wantsToCode = /\b(code|coding|implement|write|solve|program|function|algorithm)\b/i.test(message);
    if (wantsToCode && !response.includes('Code Shell')) {
      response += '\n\n🔥 **Want to implement this?** I can open a **Code Shell** for you to practice coding this step by step!';
    }

    // AI will naturally generate its own follow-up prompts - no need to force generic ones

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
