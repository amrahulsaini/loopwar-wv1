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

// Enhanced AI response processing function
function enhanceAIResponse(response: string, userMessage: string): string {
  let enhancedResponse = response;

  // Detect if user wants coding practice
  const wantsToCode = /\b(code|coding|implement|write|solve|program|function|algorithm|practice)\b/i.test(userMessage);
  const hasCodeShellMention = response.toLowerCase().includes('code shell');

  // Add Code Shell suggestion if relevant and not already mentioned
  if (wantsToCode && !hasCodeShellMention) {
    enhancedResponse += '\n\n🔥 **Ready to practice?** I can open a **Code Shell** for you to implement this step by step!';
  }

  // Remove the repeated "Remember" line - context is already in system prompt
  // No longer adding problem-specific context to avoid repetition

  // Ensure response has proper formatting
  if (!enhancedResponse.includes('**')) {
    // Add minimal formatting if AI didn't use the structured format
    enhancedResponse = enhancedResponse.replace(/^([^\\n]+)/, '🎯 **$1**');
  }

  return enhancedResponse;
}

// Message interface for type safety
interface ChatMessage {
  message: string;
  response: string;
  message_type: 'user' | 'ai';
  created_at?: string;
}

// Enhanced conversation context builder
function buildEnhancedContext(messages: ChatMessage[], maxMessages: number = 6): string {
  if (!messages || messages.length === 0) {
    return 'Fresh conversation - no previous context.';
  }

  // Get recent messages with better context
  const recentMessages = messages.slice(-maxMessages);
  
  return recentMessages.map((msg) => {
    if (msg.message_type === 'user') {
      return `👤 STUDENT: ${msg.message}`;
    } else {
      // Truncate long AI responses for context
      const truncatedResponse = msg.response.length > 200 
        ? msg.response.substring(0, 200) + '...'
        : msg.response;
      return `🤖 LOOPAI: ${truncatedResponse}`;
    }
  }).join('\\n\\n');
}

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

    // Type-safe conversion to ChatMessage array
    const typedMessages: ChatMessage[] = conversationHistory.map(msg => ({
      message: msg.message,
      response: msg.response,
      message_type: msg.message_type as 'user' | 'ai'
    }));

    // Format conversation history for enhanced context
    const contextMessages = buildEnhancedContext(typedMessages.reverse());

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

    // Enhanced AI prompt with improved conversation structure and context awareness
    const systemPrompt = `You are LOOPAI, an expert coding mentor who explains things in VERY SIMPLE words! 🚀

PERSONA:
- Use simple, clear language (like explaining to a friend)
- Break complex topics into small, easy chunks
- Ask if the student needs more detail or simpler explanation
- Focus on making concepts crystal clear before moving forward

LEARNING CONTEXT:
📍 You're helping with: ${categoryDisplay} → ${topicDisplay} → ${subtopicDisplay}
🎯 Current Problem: #${sortOrder}${problem ? `
📝 **${problem.title}** (${problem.difficulty} level)
🎪 ${problem.description}` : ''}

CONVERSATION HISTORY:
${contextMessages || 'Fresh conversation - no previous context.'}

SMART RESPONSE STRATEGY:
✅ ANALYZE the user's question and CREATE CUSTOM section headers that fit perfectly
✅ DON'T use predefined section types - create your own based on context
✅ Keep each section to 2-3 short bullet points maximum
✅ Use simple language, no complex paragraphs
✅ Generate 3 CLICKABLE follow-up questions (not statements)

DYNAMIC SECTION CREATION:
Instead of using fixed section types, CREATE section headers that match the user's question:

Examples:
- If they ask "What is recursion?" → Create sections like "� **The Simple Idea**", "🧠 **How Your Brain Should Think About It**"
- If they ask "Why won't my code work?" → Create sections like "🕵️ **Let's Debug This**", "⚠️ **Most Common Culprits**" 
- If they ask "How to optimize this?" → Create sections like "🚀 **Speed It Up**", "� **Smart Tricks**"

CREATIVE SECTION NAMING:
- Use relevant emojis that match the topic
- Make headers conversational and engaging
- Focus on what the user actually needs to know
- Create sections that feel natural for their specific question

FORMAT RULES:
- Use bullet points (•) instead of asterisks (**)
- Keep explanations short and simple
- Make follow-ups as clickable questions
- Be creative with section names based on user's question

QUESTION ANALYSIS: "${message}"

Create custom section headers that perfectly match their question and make it engaging!

Example headers you can use (create your own based on the question):
🎯 **Quick Answer** - for direct questions needing immediate answers
💡 **Let me break this down** - for complex concepts needing explanation
🔍 **Here's an example** - when examples would help understanding
🔥 **Try this** - for actionable steps or practice suggestions
⚠️ **Watch out for** - for common mistakes or important warnings
🤔 **Think about it** - for conceptual understanding questions
🚀 **Next level** - for advanced concepts or optimizations
📚 **What's next?** - for follow-up questions (always include this)

FORMAT RULES:
- Use bullet points (•) instead of asterisks (**)
- Keep explanations short and simple
- Ask questions to check understanding
- Generate 3 follow-ups specific to their question

STUDENT'S QUESTION: "${message}"

Remember: Choose sections that fit their question, use bullets not asterisks, keep it simple!`;

    // Generate enhanced AI response using Gemini 2.0 Flash
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: systemPrompt
    });

    let response = result.text || 'Sorry, I encountered an issue generating a response.';

    // Enhanced response processing and validation
    response = enhanceAIResponse(response, message);

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
