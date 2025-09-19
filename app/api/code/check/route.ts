import { NextRequest, NextResponse } from 'next/server';
import aiCodeChecker from '@/lib/ai-code-checker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, language, problemDescription, testCases } = body;

    // Validate required fields
    if (!code || !language) {
      return NextResponse.json({
        success: false,
        error: 'Code and language are required'
      }, { status: 400 });
    }

    console.log('AI Code Check API: Analyzing', language, 'code');

    // Use AI to check the code
    const result = await aiCodeChecker.checkCode(
      code,
      language,
      problemDescription || "General coding problem",
      testCases || []
    );

    return NextResponse.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('AI Code Check API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}