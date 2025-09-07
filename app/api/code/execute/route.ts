import { NextRequest, NextResponse } from 'next/server';
import judge0Service from '@/lib/judge0-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, language, testCases } = body;

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

    const result = await judge0Service.executeWithTestCases(code, language, testCases);

    console.log('API: Execution result:', result);

    return NextResponse.json({
      success: result.success,
      results: result.results,
      overallStatus: result.overallStatus,
      error: result.error
    });

  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error',
        results: [],
        overallStatus: 'Error'
      },
      { status: 500 }
    );
  }
}
