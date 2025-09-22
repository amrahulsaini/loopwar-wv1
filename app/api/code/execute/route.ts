import { NextRequest, NextResponse } from 'next/server';
import { AICodeChecker } from '@/lib/ai-code-checker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, language, testCases, problemDescription } = body;

    if (!code || !language || !testCases) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: code, language, testCases' },
        { status: 400 }
      );
    }

    console.log('API: Executing code with test cases:', {
      language,
      codeLength: code.length,
      testCaseCount: testCases.length
    });

    // Use AI code checker instead of Judge0
    const aiCodeChecker = new AICodeChecker();
    const result = await aiCodeChecker.checkCode(
      code, 
      language, 
      problemDescription || "Code execution test", 
      testCases
    );

    console.log('API: Execution result:', result);

    return NextResponse.json({
      success: result.success,
      result: result,
      error: result.success ? undefined : result.feedback
    });

  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error',
        result: null
      },
      { status: 500 }
    );
  }
}
