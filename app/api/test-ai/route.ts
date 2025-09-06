import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function GET() {
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

  } catch (error: unknown) {
    console.error('API key test error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStatus = (error as { status?: number })?.status;
    
    return NextResponse.json({ 
      success: false,
      error: errorMessage,
      details: errorStatus ? `Status: ${errorStatus}` : 'Unknown error',
      suggestion: errorMessage.includes('API key') 
        ? 'Check if your API key is valid and has access to Gemini 2.0 Flash'
        : 'Check your internet connection and try again'
    }, { status: 500 });
  }
}
