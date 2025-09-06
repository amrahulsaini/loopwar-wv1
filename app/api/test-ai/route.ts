import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'API key not found in environment variables',
        debug: 'Make sure GEMINI_API_KEY is set in .env.local'
      }, { status: 500 });
    }

    console.log('Testing API key:', apiKey.substring(0, 10) + '...');

    const ai = new GoogleGenAI({ apiKey });

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Say hello world and confirm you're working!",
    });

    const response = result.text;

    return NextResponse.json({ 
      success: true,
      message: 'Gemini 2.0 Flash is working!',
      response: response,
      apiKeyPrefix: apiKey.substring(0, 10) + '...'
    });

  } catch (error: any) {
    console.error('API key test error:', error);
    
    return NextResponse.json({ 
      success: false,
      error: error.message,
      details: error.status ? `Status: ${error.status}` : 'Unknown error',
      suggestion: error.message.includes('API key') 
        ? 'Check if your API key is valid and has access to Gemini 2.0 Flash'
        : 'Check your internet connection and try again'
    }, { status: 500 });
  }
}
